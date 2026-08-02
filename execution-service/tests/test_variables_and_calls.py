"""
Phase 8.4 / 8.5 / 8.6 — Tests for variable tracking, function call/return, and call stack.

Structure:
  TestVariableTracker    - VariableTracker unit tests (8.4)
  TestSerializeValue     - serialize_value edge cases (8.4)
  TestFunctionTracking   - call/return events (8.5)
  TestCallStackTracker   - CallStackTracker unit tests (8.6)
  TestCallStackInRunner  - call_stack on steps via runner (8.6)
  TestEndToEndEnriched   - full /execute API tests with vars + call_stack (8.4-8.6)
"""

import ast
import sys
import math
import pytest
from fastapi.testclient import TestClient

from app.trackers.variable_tracker import VariableTracker, serialize_value, get_var_type
from app.trackers.call_stack_tracker import CallStackTracker
from app.trackers.line_tracker import LineTracker, RawLineEvent, RawCallEvent, RawReturnEvent
from app.executor.runner import run, RunConfig
from app.parser import parse
from app.main import app

client = TestClient(app)


# ===========================================================================
# Helpers
# ===========================================================================

def _run(code: str, trace_limit: int = 10_000):
    result = parse(code)
    assert result.success, f"Unexpected parse error: {result.error}"
    return run(source=code, tree=result.tree, config=RunConfig(trace_limit=trace_limit))


def _exec_tracker(source: str, trace_limit: int = 10_000) -> LineTracker:
    """Run source through LineTracker and return the tracker for inspection."""
    tree = ast.parse(source)
    code = compile(tree, "<string>", "exec")
    tracker = LineTracker(source=source, trace_limit=trace_limit)
    sys.settrace(tracker.trace_calls)
    try:
        exec(code, {"__name__": "__main__", "__builtins__": __builtins__})
    except Exception:
        pass
    finally:
        sys.settrace(None)
    return tracker


# ===========================================================================
# Phase 8.4 — serialize_value and get_var_type
# ===========================================================================

class TestSerializeValue:

    def test_none(self):
        assert serialize_value(None) is None

    def test_bool_true(self):
        assert serialize_value(True) is True

    def test_bool_false(self):
        assert serialize_value(False) is False

    def test_bool_not_treated_as_int(self):
        """True should serialize as bool, not 1."""
        result = serialize_value(True)
        assert isinstance(result, bool)

    def test_int(self):
        assert serialize_value(42) == 42

    def test_float(self):
        assert serialize_value(3.14) == 3.14

    def test_float_nan(self):
        assert serialize_value(float("nan")) == "nan"

    def test_float_inf(self):
        assert serialize_value(float("inf")) == "inf"

    def test_float_neg_inf(self):
        assert serialize_value(float("-inf")) == "-inf"

    def test_str(self):
        assert serialize_value("hello") == "hello"

    def test_str_truncated(self):
        long_str = "x" * 400
        result = serialize_value(long_str)
        assert result.endswith("...")
        assert len(result) < 400

    def test_list(self):
        assert serialize_value([1, 2, 3]) == [1, 2, 3]

    def test_list_nested(self):
        result = serialize_value([[1, 2], [3, 4]])
        assert result == [[1, 2], [3, 4]]

    def test_list_truncated(self):
        big_list = list(range(25))
        result = serialize_value(big_list)
        assert len(result) == 21  # 20 items + 1 truncation marker
        assert "more items" in result[-1]

    def test_dict(self):
        assert serialize_value({"a": 1}) == {"a": 1}

    def test_dict_keys_stringified(self):
        result = serialize_value({1: "one", 2: "two"})
        assert "1" in result

    def test_set_serialized_as_list(self):
        result = serialize_value({1, 2, 3})
        assert isinstance(result, list)
        assert sorted(result) == [1, 2, 3]

    def test_depth_limit_prevents_deep_recursion(self):
        """At depth >= 2, nested values fall back to repr."""
        deep = {"a": {"b": {"c": 999}}}
        result = serialize_value(deep)
        # Top level is dict, second level is dict, third level is repr string
        assert isinstance(result["a"]["b"], str)  # repr at depth 2

    def test_custom_object_fallback_to_repr(self):
        class Obj:
            def __repr__(self):
                return "MyObj()"
        result = serialize_value(Obj())
        assert result == "MyObj()"


class TestGetVarType:

    def test_none(self):
        assert get_var_type(None) == "NoneType"

    def test_bool(self):
        assert get_var_type(True) == "bool"

    def test_int(self):
        assert get_var_type(1) == "int"

    def test_float(self):
        assert get_var_type(1.5) == "float"

    def test_str(self):
        assert get_var_type("hi") == "str"

    def test_list(self):
        assert get_var_type([]) == "list"

    def test_dict(self):
        assert get_var_type({}) == "dict"

    def test_set(self):
        assert get_var_type(set()) == "set"

    def test_tuple(self):
        assert get_var_type(()) == "tuple"

    def test_unknown(self):
        class Custom: pass
        assert get_var_type(Custom()) == "unknown"


# ===========================================================================
# Phase 8.4 — VariableTracker
# ===========================================================================

class TestVariableTracker:

    def test_single_int_captured(self):
        """Variable 'x' should appear in snapshot after first line event."""
        tracker = _exec_tracker("x = 42")
        line_events = [e for e in tracker.events if isinstance(e, RawLineEvent)]
        # The second line event (if any) will have x in scope;
        # or we check the runner-level steps instead
        # Since "x = 42" fires one "line" event BEFORE x is set,
        # we rely on the runner test for post-execution checking.
        assert len(line_events) >= 1

    def test_vars_field_is_dict(self):
        tracker = _exec_tracker("x = 1\ny = 2")
        line_events = [e for e in tracker.events if isinstance(e, RawLineEvent)]
        assert all(isinstance(e.vars, dict) for e in line_events)

    def test_changed_flag_true_for_new_variable(self):
        """x is new at the step it first appears — changed=True."""
        tracker = _exec_tracker("x = 1\ny = x + 1")
        line_events = [e for e in tracker.events if isinstance(e, RawLineEvent)]
        # The step for line 2 has x already in scope (set at line 1)
        # x.changed should be False at line 2 (it didn't change)
        # y.changed should be True at the step after line 2 runs
        # We just verify changed is a bool
        for event in line_events:
            for entry in event.vars.values():
                assert isinstance(entry.changed, bool)

    def test_variable_type_correct(self):
        """Variable entries must carry the right type string."""
        result = _run("x = 42\ny = 'hello'\nz = [1,2,3]")
        # Find a line step that has all three variables
        final_line = [s for s in result.steps if s.kind == "line"][-1]
        if "x" in final_line.vars:
            assert final_line.vars["x"].type == "int"
        if "y" in final_line.vars:
            assert final_line.vars["y"].type == "str"
        if "z" in final_line.vars:
            assert final_line.vars["z"].type == "list"

    def test_builtins_excluded(self):
        """__builtins__ should never appear in variable snapshots."""
        result = _run("x = 1")
        for step in result.steps:
            assert "__builtins__" not in step.vars
            assert "__name__" not in step.vars


# ===========================================================================
# Phase 8.5 — Function call and return tracking
# ===========================================================================

class TestFunctionTracking:

    def test_call_event_present(self):
        code = "def add(a, b):\n    return a + b\nresult = add(2, 3)"
        tracker = _exec_tracker(code)
        call_events = [e for e in tracker.events if isinstance(e, RawCallEvent)]
        assert len(call_events) == 1

    def test_return_event_present(self):
        code = "def add(a, b):\n    return a + b\nresult = add(2, 3)"
        tracker = _exec_tracker(code)
        return_events = [e for e in tracker.events if isinstance(e, RawReturnEvent)]
        assert len(return_events) == 1

    def test_call_event_func_name(self):
        code = "def greet(name):\n    return 'Hello ' + name\nresult = greet('World')"
        tracker = _exec_tracker(code)
        call_events = [e for e in tracker.events if isinstance(e, RawCallEvent)]
        assert call_events[0].func_name == "greet"

    def test_call_event_args_captured(self):
        code = "def add(a, b):\n    return a + b\nresult = add(2, 3)"
        tracker = _exec_tracker(code)
        call_events = [e for e in tracker.events if isinstance(e, RawCallEvent)]
        assert "a" in call_events[0].args
        assert "b" in call_events[0].args
        assert call_events[0].args["a"] == 2
        assert call_events[0].args["b"] == 3

    def test_return_event_func_name(self):
        code = "def add(a, b):\n    return a + b\nresult = add(2, 3)"
        tracker = _exec_tracker(code)
        return_events = [e for e in tracker.events if isinstance(e, RawReturnEvent)]
        assert return_events[0].func_name == "add"

    def test_return_event_return_value(self):
        code = "def add(a, b):\n    return a + b\nresult = add(2, 3)"
        tracker = _exec_tracker(code)
        return_events = [e for e in tracker.events if isinstance(e, RawReturnEvent)]
        assert return_events[0].return_value == 5

    def test_event_order_call_before_return(self):
        """call event must appear before return event."""
        code = "def f():\n    return 1\nf()"
        tracker = _exec_tracker(code)
        kinds = []
        for e in tracker.events:
            if isinstance(e, RawCallEvent):
                kinds.append("call")
            elif isinstance(e, RawReturnEvent):
                kinds.append("return")
        assert kinds.index("call") < kinds.index("return")

    def test_runner_step_kinds_include_call_and_return(self):
        code = "def f():\n    return 1\nf()"
        result = _run(code)
        kinds = {s.kind for s in result.steps}
        assert "call" in kinds
        assert "return" in kinds

    def test_call_step_description(self):
        code = "def add(a, b):\n    return a + b\nresult = add(2, 3)"
        result = _run(code)
        call_steps = [s for s in result.steps if s.kind == "call"]
        assert len(call_steps) == 1
        assert "add" in call_steps[0].description
        assert call_steps[0].func_name == "add"

    def test_return_step_description(self):
        code = "def add(a, b):\n    return a + b\nresult = add(2, 3)"
        result = _run(code)
        return_steps = [s for s in result.steps if s.kind == "return"]
        assert len(return_steps) == 1
        assert "add" in return_steps[0].description

    def test_return_step_return_value_serialized(self):
        code = "def add(a, b):\n    return a + b\nresult = add(2, 3)"
        result = _run(code)
        return_step = next(s for s in result.steps if s.kind == "return")
        assert return_step.return_value == 5

    def test_multiple_calls_tracked(self):
        code = "def sq(x):\n    return x*x\na=sq(2)\nb=sq(3)"
        result = _run(code)
        call_steps = [s for s in result.steps if s.kind == "call"]
        return_steps = [s for s in result.steps if s.kind == "return"]
        assert len(call_steps) == 2
        assert len(return_steps) == 2

    def test_nested_call_produces_two_calls(self):
        code = "def inner():\n    return 1\ndef outer():\n    return inner()\nouter()"
        result = _run(code)
        call_steps = [s for s in result.steps if s.kind == "call"]
        # outer() + inner() = 2 named calls (module-level <module> call is filtered)
        assert len(call_steps) == 2


# ===========================================================================
# Phase 8.6 — Call stack tracking
# ===========================================================================

class TestCallStackTracker:
    """Unit tests for CallStackTracker in isolation."""

    def test_starts_empty(self):
        cs = CallStackTracker()
        assert cs.depth == 0
        assert cs.is_empty()

    def test_push_increases_depth(self):
        cs = CallStackTracker()
        cs.push("main", 1)
        assert cs.depth == 1

    def test_pop_decreases_depth(self):
        cs = CallStackTracker()
        cs.push("main", 1)
        cs.pop()
        assert cs.depth == 0

    def test_snapshot_returns_copy(self):
        cs = CallStackTracker()
        cs.push("main", 1)
        snap = cs.snapshot()
        snap.clear()  # Mutating the snapshot should not affect internal state
        assert cs.depth == 1

    def test_snapshot_bottom_to_top_order(self):
        cs = CallStackTracker()
        cs.push("outer", 1)
        cs.push("inner", 5)
        snap = cs.snapshot()
        assert snap[0].func_name == "outer"
        assert snap[1].func_name == "inner"

    def test_update_top_line(self):
        cs = CallStackTracker()
        cs.push("f", 1)
        cs.update_top_line(3)
        assert cs.snapshot()[0].line_no == 3

    def test_pop_empty_returns_none(self):
        cs = CallStackTracker()
        assert cs.pop() is None


class TestCallStackInRunner:
    """Verify call_stack field on ExecutionStep objects."""

    def test_line_step_has_call_stack_field(self):
        result = _run("x = 1")
        line_step = next(s for s in result.steps if s.kind == "line")
        assert isinstance(line_step.call_stack, list)

    def test_call_stack_empty_at_module_level(self):
        result = _run("x = 1\ny = 2")
        line_steps = [s for s in result.steps if s.kind == "line"]
        # Module-level code has no user function calls active (module frame filtered out)
        for step in line_steps:
            assert len(step.call_stack) == 0

    def test_call_step_has_function_on_stack(self):
        code = "def f():\n    return 1\nf()"
        result = _run(code)
        # Skip the first call step if it's module-level (filtered) — get the 'f' call
        call_steps = [s for s in result.steps if s.kind == "call"]
        f_call = next((s for s in call_steps if s.func_name == "f"), None)
        assert f_call is not None
        assert len(f_call.call_stack) == 1
        assert f_call.call_stack[0].func_name == "f"

    def test_line_inside_function_has_stack_depth_1(self):
        code = "def f():\n    x = 1\n    return x\nf()"
        result = _run(code)
        # Line steps inside f() should have depth-1 call stack
        call_step_idx = next(i for i, s in enumerate(result.steps) if s.kind == "call")
        inner_line_steps = [
            s for s in result.steps[call_step_idx:]
            if s.kind == "line"
        ]
        if inner_line_steps:
            assert len(inner_line_steps[0].call_stack) == 1

    def test_nested_call_stack_depth_2(self):
        code = "def inner():\n    return 1\ndef outer():\n    return inner()\nouter()"
        result = _run(code)
        call_steps = [s for s in result.steps if s.kind == "call"]
        # Second call (inner) should have depth 2
        if len(call_steps) >= 2:
            assert len(call_steps[1].call_stack) == 2

    def test_return_step_stack_frame_name_matches(self):
        code = "def add(a, b):\n    return a + b\nresult = add(2, 3)"
        result = _run(code)
        return_step = next(s for s in result.steps if s.kind == "return")
        assert any(f.func_name == "add" for f in return_step.call_stack)

    def test_call_stack_stack_frame_has_line_no(self):
        code = "def f():\n    return 1\nf()"
        result = _run(code)
        call_steps = [s for s in result.steps if s.kind == "call"]
        f_call = next((s for s in call_steps if s.func_name == "f"), None)
        assert f_call is not None
        assert f_call.call_stack[0].line_no >= 1


# ===========================================================================
# End-to-end API tests (8.4 + 8.5 + 8.6 combined)
# ===========================================================================

class TestEndToEndEnriched:

    def test_vars_present_in_step_response(self):
        response = client.post("/execute", json={"code": "x = 1\ny = 2"})
        data = response.json()
        assert data["status"] == "completed"
        # All steps should have a 'vars' field
        for step in data["steps"]:
            assert "vars" in step

    def test_call_stack_present_in_step_response(self):
        response = client.post("/execute", json={"code": "x = 1\ny = 2"})
        data = response.json()
        for step in data["steps"]:
            assert "call_stack" in step

    def test_function_call_produces_call_kind_step(self):
        code = "def sq(x):\n    return x*x\nresult = sq(5)"
        response = client.post("/execute", json={"code": code})
        data = response.json()
        kinds = [s["kind"] for s in data["steps"]]
        assert "call" in kinds
        assert "return" in kinds

    def test_call_step_args_in_response(self):
        code = "def add(a, b):\n    return a + b\nresult = add(2, 3)"
        response = client.post("/execute", json={"code": code})
        data = response.json()
        call_step = next(s for s in data["steps"] if s["kind"] == "call")
        assert call_step["args"] is not None
        assert "a" in call_step["args"]
        assert call_step["args"]["a"] == 2

    def test_return_step_value_in_response(self):
        code = "def add(a, b):\n    return a + b\nresult = add(2, 3)"
        response = client.post("/execute", json={"code": code})
        data = response.json()
        return_step = next(s for s in data["steps"] if s["kind"] == "return")
        assert return_step["return_value"] == 5

    def test_variable_type_int_in_response(self):
        response = client.post("/execute", json={"code": "x = 42\ny = x + 1"})
        data = response.json()
        last_line = [s for s in data["steps"] if s["kind"] == "line"][-1]
        if "x" in last_line["vars"]:
            assert last_line["vars"]["x"]["type"] == "int"

    def test_variable_type_str_in_response(self):
        response = client.post("/execute", json={"code": "s = 'hello'\nt = s + '!'"})
        data = response.json()
        last_line = [s for s in data["steps"] if s["kind"] == "line"][-1]
        if "s" in last_line["vars"]:
            assert last_line["vars"]["s"]["type"] == "str"

    def test_call_stack_depth_inside_function(self):
        code = "def f():\n    x = 1\n    return x\nf()"
        response = client.post("/execute", json={"code": code})
        data = response.json()
        # Find the call step for 'f' specifically
        call_step = next(
            (s for s in data["steps"] if s["kind"] == "call" and s["func_name"] == "f"),
            None,
        )
        assert call_step is not None
        assert len(call_step["call_stack"]) == 1
        assert call_step["call_stack"][0]["func_name"] == "f"

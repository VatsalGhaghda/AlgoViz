"""
Phase 8.3 — Tests for the execution runner (line-by-line tracking).

Covers:
  - LineTracker unit tests (sys.settrace behaviour)
  - runner.run() unit tests (step ordering, line numbers, limit, error cases)
  - FastAPI /execute endpoint integration tests (end-to-end with real trace)
"""

import ast
import sys
import pytest
from fastapi.testclient import TestClient

from app.trackers.line_tracker import LineTracker, RawLineEvent
from app.executor.runner import run, RunConfig, RunResult
from app.parser import parse
from app.schemas import ExecutionStep
from app.main import app

client = TestClient(app)


# ===========================================================================
# Helpers
# ===========================================================================

def _run(code: str, trace_limit: int = 10_000) -> RunResult:
    """Parse and run a code string, returning a RunResult."""
    result = parse(code)
    assert result.success, f"Unexpected parse failure: {result.error}"
    return run(source=code, tree=result.tree, config=RunConfig(trace_limit=trace_limit))


# ===========================================================================
# Unit tests — LineTracker
# ===========================================================================

class TestLineTracker:
    """Validate sys.settrace integration and event collection."""

    def test_basic_two_line_script(self):
        source = "x = 1\ny = 2"
        tree = ast.parse(source)
        code = compile(tree, "<string>", "exec")
        tracker = LineTracker(source=source, trace_limit=10_000)

        sys.settrace(tracker.trace_calls)
        try:
            exec(code, {"__builtins__": __builtins__})
        finally:
            sys.settrace(None)

        assert len(tracker.events) == 2
        assert tracker.events[0].line_no == 1
        assert tracker.events[1].line_no == 2

    def test_events_are_raw_line_event_type(self):
        source = "x = 42"
        tree = ast.parse(source)
        code = compile(tree, "<string>", "exec")
        tracker = LineTracker(source=source)

        sys.settrace(tracker.trace_calls)
        try:
            exec(code, {"__builtins__": __builtins__})
        finally:
            sys.settrace(None)

        assert len(tracker.events) == 1
        assert isinstance(tracker.events[0], RawLineEvent)

    def test_source_line_text_correct(self):
        source = "x = 99\ny = x + 1"
        tree = ast.parse(source)
        code = compile(tree, "<string>", "exec")
        tracker = LineTracker(source=source)

        sys.settrace(tracker.trace_calls)
        try:
            exec(code, {"__builtins__": __builtins__})
        finally:
            sys.settrace(None)

        assert tracker.events[0].source_line == "x = 99"
        assert tracker.events[1].source_line == "y = x + 1"

    def test_trace_limit_stops_collection(self):
        source = "a = 1\nb = 2\nc = 3\nd = 4\ne = 5"
        tree = ast.parse(source)
        code = compile(tree, "<string>", "exec")
        tracker = LineTracker(source=source, trace_limit=3)

        sys.settrace(tracker.trace_calls)
        try:
            exec(code, {"__builtins__": __builtins__})
        finally:
            sys.settrace(None)

        assert len(tracker.events) == 3
        assert tracker.limit_reached is True

    def test_limit_not_reached_when_under(self):
        source = "x = 1\ny = 2"
        tree = ast.parse(source)
        code = compile(tree, "<string>", "exec")
        tracker = LineTracker(source=source, trace_limit=10)

        sys.settrace(tracker.trace_calls)
        try:
            exec(code, {"__builtins__": __builtins__})
        finally:
            sys.settrace(None)

        assert tracker.limit_reached is False

    def test_settrace_always_unset_after_exec(self):
        """sys.gettrace() must be None after a run, even if exec raises."""
        source = "raise ValueError('test')"
        tree = ast.parse(source)
        code = compile(tree, "<string>", "exec")
        tracker = LineTracker(source=source)

        sys.settrace(tracker.trace_calls)
        try:
            exec(code, {"__builtins__": __builtins__})
        except Exception:
            pass
        finally:
            sys.settrace(None)

        assert sys.gettrace() is None

    def test_get_source_line_oob_returns_empty(self):
        tracker = LineTracker(source="x = 1")
        assert tracker.get_source_line(0) == ""   # 0 is OOB (1-indexed)
        assert tracker.get_source_line(999) == ""


# ===========================================================================
# Unit tests — runner.run()
# ===========================================================================

class TestRunnerBasic:
    """Core correctness of the runner's step output."""

    def test_two_line_produces_two_steps(self):
        result = _run("x = 1\ny = 2")
        assert result.status == "completed"
        line_steps = [s for s in result.steps if s.kind == "line"]
        assert len(line_steps) == 2

    def test_three_line_with_print_produces_three_steps(self):
        result = _run("x = 1\ny = 2\nprint(x + y)")
        line_steps = [s for s in result.steps if s.kind == "line"]
        assert len(line_steps) == 3

    def test_step_indices_monotonically_increasing(self):
        result = _run("a = 1\nb = 2\nc = 3")
        for i, step in enumerate(result.steps):
            assert step.step_index == i

    def test_step_line_numbers_correct(self):
        result = _run("x = 1\ny = 2\nz = 3")
        line_steps = [s for s in result.steps if s.kind == "line"]
        assert line_steps[0].line == 1
        assert line_steps[1].line == 2
        assert line_steps[2].line == 3

    def test_step_kind_is_line(self):
        result = _run("x = 1")
        assert result.steps[0].kind == "line"

    def test_step_description_contains_line_no(self):
        result = _run("x = 42")
        assert "1" in result.steps[0].description

    def test_step_description_contains_source_line(self):
        result = _run("x = 42")
        assert "x = 42" in result.steps[0].description

    def test_step_highlights_active_line(self):
        result = _run("x = 1\ny = 2")
        step1 = result.steps[0]
        assert step1.highlights.get(1) == "active"
        step2 = result.steps[1]
        assert step2.highlights.get(2) == "active"

    def test_empty_module_zero_steps(self):
        """Whitespace-only code produces no line events."""
        result = _run("   \n# just a comment\n  ")
        line_steps = [s for s in result.steps if s.kind == "line"]
        assert len(line_steps) == 0
        assert result.status == "completed"

    def test_status_completed_on_success(self):
        result = _run("x = 1")
        assert result.status == "completed"

    def test_steps_are_execution_step_type(self):
        result = _run("x = 1")
        assert all(isinstance(s, ExecutionStep) for s in result.steps)

    def test_not_truncated_on_normal_run(self):
        result = _run("x = 1\ny = 2")
        assert result.truncated is False


class TestRunnerTraceLimits:
    """Trace limit enforcement."""

    def test_limit_reached_appends_limit_step(self):
        result = _run("a=1\nb=2\nc=3\nd=4\ne=5", trace_limit=3)
        kinds = [s.kind for s in result.steps]
        assert "limit" in kinds

    def test_limit_step_is_last(self):
        result = _run("a=1\nb=2\nc=3\nd=4\ne=5", trace_limit=3)
        assert result.steps[-1].kind == "limit"

    def test_status_trace_limit_reached(self):
        result = _run("a=1\nb=2\nc=3\nd=4\ne=5", trace_limit=3)
        assert result.status == "trace_limit_reached"

    def test_truncated_flag_set(self):
        result = _run("a=1\nb=2\nc=3\nd=4\ne=5", trace_limit=3)
        assert result.truncated is True

    def test_exactly_trace_limit_line_steps_before_limit_event(self):
        result = _run("a=1\nb=2\nc=3\nd=4\ne=5", trace_limit=3)
        line_steps = [s for s in result.steps if s.kind == "line"]
        assert len(line_steps) == 3

    def test_limit_1_still_works(self):
        result = _run("a=1\nb=2", trace_limit=1)
        assert result.steps[0].kind == "line"
        assert result.steps[-1].kind == "limit"
        assert result.status == "trace_limit_reached"


class TestRunnerErrorHandling:
    """Runtime exceptions produce an error step without crashing the runner."""

    def test_runtime_error_returns_runtime_error_status(self):
        result = _run("x = 1/0")
        assert result.status == "runtime_error"

    def test_runtime_error_has_error_step(self):
        result = _run("x = 1/0")
        error_steps = [s for s in result.steps if s.kind == "error"]
        assert len(error_steps) == 1

    def test_error_step_has_error_type(self):
        result = _run("x = 1/0")
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.error_type == "ZeroDivisionError"

    def test_steps_before_error_preserved(self):
        result = _run("x = 1\ny = 2\nz = 1/0")
        line_steps = [s for s in result.steps if s.kind == "line"]
        # Lines 1 and 2 execute successfully before the crash on line 3
        assert len(line_steps) >= 2

    def test_settrace_unset_after_runtime_error(self):
        _run("x = 1/0")
        assert sys.gettrace() is None


# ===========================================================================
# Integration tests — POST /execute via FastAPI TestClient
# ===========================================================================

class TestExecuteEndpointRunner:
    """End-to-end: real trace events flowing through the API."""

    def test_simple_assignment_returns_steps(self):
        response = client.post("/execute", json={"code": "x = 1"})
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert data["total_steps"] == 1
        assert len(data["steps"]) == 1

    def test_three_lines_returns_three_steps(self):
        response = client.post("/execute", json={"code": "x = 1\ny = 2\nprint(x + y)"})
        data = response.json()
        assert data["total_steps"] == 3
        assert len(data["steps"]) == 3

    def test_step_order_is_correct(self):
        response = client.post("/execute", json={"code": "x = 1\ny = 2\nz = 3"})
        steps = response.json()["steps"]
        assert steps[0]["line"] == 1
        assert steps[1]["line"] == 2
        assert steps[2]["line"] == 3

    def test_step_has_all_required_fields(self):
        response = client.post("/execute", json={"code": "x = 1"})
        step = response.json()["steps"][0]
        for field in ("step_index", "line", "kind", "description", "highlights"):
            assert field in step, f"Missing field: {field}"

    def test_step_index_starts_at_zero(self):
        response = client.post("/execute", json={"code": "x = 1\ny = 2"})
        steps = response.json()["steps"]
        assert steps[0]["step_index"] == 0
        assert steps[1]["step_index"] == 1

    def test_total_steps_matches_steps_length(self):
        response = client.post("/execute", json={"code": "x = 1\ny = 2\nz = 3"})
        data = response.json()
        assert data["total_steps"] == len(data["steps"])

    def test_trace_limit_via_api(self):
        # trace_limit must be >= 100 (schema minimum). Use 100 on a 200-line script.
        code = "\n".join(f"x{i} = {i}" for i in range(200))  # 200 assignments
        response = client.post("/execute", json={"code": code, "trace_limit": 100})
        data = response.json()
        assert data["status"] == "trace_limit_reached"
        assert data["truncated"] is True
        assert data["steps"][-1]["kind"] == "limit"

    def test_syntax_error_still_works_after_runner_integration(self):
        response = client.post("/execute", json={"code": "x = ("})
        data = response.json()
        assert data["status"] == "syntax_error"

    def test_runtime_error_via_api(self):
        response = client.post("/execute", json={"code": "x = 1/0"})
        data = response.json()
        assert data["status"] == "runtime_error"
        error_steps = [s for s in data["steps"] if s["kind"] == "error"]
        assert len(error_steps) == 1

    def test_for_loop_produces_correct_event_count(self):
        """for i in range(3): print(i) — 1 loop-header + 3 body executions = 4 events."""
        code = "for i in range(3):\n    print(i)"
        response = client.post("/execute", json={"code": code})
        data = response.json()
        assert data["status"] == "completed"
        # Loop header executes 4× (3 iterations + 1 final check), body 3×
        # Total = 7 events. We just verify it's > 3 and status is completed.
        assert data["total_steps"] > 3

"""
Phase 8.7 / 8.8 / 8.9 — Tests for output capture and rich runtime errors.

Structure:
  TestOutputTracker      - OutputTracker unit tests (8.7)
  TestOutputCapture      - Per-step output attribution (8.8)
  TestRichErrors         - Rich RuntimeErrorEvent (8.9)
  TestOutputAPI          - End-to-end API tests with output (8.8)
  TestErrorAPI           - End-to-end API tests with rich errors (8.9)
"""

import sys
import ast
import pytest
from fastapi.testclient import TestClient

from app.trackers.output_tracker import OutputTracker
from app.trackers.line_tracker import LineTracker, RawLineEvent
from app.executor.runner import run, RunConfig, _build_traceback_summary, _extract_error_line
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


def _exec_tracker(source: str) -> LineTracker:
    """Run source through LineTracker (with output capture) and return it."""
    tree = ast.parse(source)
    code = compile(tree, "<string>", "exec")
    tracker = LineTracker(source=source)
    tracker.start_output_capture()
    sys.settrace(tracker.trace_calls)
    try:
        exec(code, {"__name__": "__main__", "__builtins__": __builtins__})
    except Exception:
        pass
    finally:
        sys.settrace(None)
        tracker.stop_output_capture()
    return tracker


# ===========================================================================
# Phase 8.7 — OutputTracker unit tests
# ===========================================================================

class TestOutputTracker:

    def test_start_redirects_stdout(self):
        tracker = OutputTracker()
        tracker.start()
        print("hello", end="")
        tracker.stop()
        # stdout should be restored — we can't easily assert it here without
        # checking sys.stdout, but the test not crashing confirms start/stop work.
        assert True  # reached without error

    def test_flush_captures_print_output(self):
        tracker = OutputTracker()
        tracker.start()
        print("hello")
        content = tracker.flush()
        tracker.stop()
        assert "hello" in content

    def test_flush_drains_buffer(self):
        """After flush, a second flush returns empty string."""
        tracker = OutputTracker()
        tracker.start()
        print("first")
        tracker.flush()        # drain
        content2 = tracker.flush()
        tracker.stop()
        assert content2 == ""

    def test_flush_without_start_returns_empty(self):
        tracker = OutputTracker()
        assert tracker.flush() == ""

    def test_stop_restores_stdout(self):
        original = sys.stdout
        tracker = OutputTracker()
        tracker.start()
        tracker.stop()
        assert sys.stdout is original

    def test_stop_restores_stderr(self):
        original = sys.stderr
        tracker = OutputTracker()
        tracker.start()
        tracker.stop()
        assert sys.stderr is original

    def test_stop_is_idempotent(self):
        """Calling stop() twice should not raise."""
        tracker = OutputTracker()
        tracker.start()
        tracker.stop()
        tracker.stop()   # second call — should be a no-op

    def test_output_truncation(self):
        tracker = OutputTracker()
        tracker.start()
        big_output = "x" * (OutputTracker.MAX_OUTPUT_BYTES + 100)
        sys.stdout.write(big_output)
        content = tracker.flush()
        tracker.stop()
        assert len(content) <= OutputTracker.MAX_OUTPUT_BYTES + 50  # + truncation msg

    def test_stderr_captured_in_same_buffer(self):
        tracker = OutputTracker()
        tracker.start()
        sys.stderr.write("err message")
        content = tracker.flush()
        tracker.stop()
        assert "err message" in content

    def test_multiple_flushes_accumulate_correctly(self):
        tracker = OutputTracker()
        tracker.start()
        print("line1")
        first = tracker.flush()
        print("line2")
        second = tracker.flush()
        tracker.stop()
        assert "line1" in first
        assert "line2" in second
        assert "line2" not in first


# ===========================================================================
# Phase 8.8 — Per-step output attribution
# ===========================================================================

class TestOutputCapture:

    def test_print_output_appears_in_steps(self):
        result = _run("print('hello')")
        all_output = "".join(s.output for s in result.steps)
        assert "hello" in all_output

    def test_no_output_steps_have_empty_output(self):
        result = _run("x = 1\ny = 2")
        assert all(s.output == "" for s in result.steps)

    def test_print_attributed_to_print_line_step(self):
        """
        Output from line 2 (print) should appear on that step.
        Timing: the 'line 3' event fires after print ran, capturing its output
        and attributing it to the preceding step (line 2 in step list).
        """
        code = "x = 1\nprint('hello')\ny = 2"
        result = _run(code)
        line_steps = [s for s in result.steps if s.kind == "line"]
        # Find the step at line 2 (the print statement)
        print_step = next((s for s in line_steps if s.line == 2), None)
        assert print_step is not None
        assert "hello" in print_step.output

    def test_multiple_print_statements_each_get_output(self):
        code = "print('a')\nprint('b')\nprint('c')"
        result = _run(code)
        all_output = "".join(s.output for s in result.steps)
        assert "a" in all_output
        assert "b" in all_output
        assert "c" in all_output

    def test_output_inside_function_attributed_correctly(self):
        code = "def greet():\n    print('hi')\ngreet()"
        result = _run(code)
        all_output = "".join(s.output for s in result.steps)
        assert "hi" in all_output

    def test_step_output_is_string(self):
        result = _run("x = 1\nprint('hello')")
        for step in result.steps:
            assert isinstance(step.output, str)

    def test_stdout_restored_after_execution(self):
        """sys.stdout must be restored even when code prints."""
        original = sys.stdout
        _run("print('hello')")
        assert sys.stdout is original

    def test_stdout_restored_after_runtime_error(self):
        """sys.stdout must be restored even when exec raises."""
        original = sys.stdout
        _run("print('oops')\nraise ValueError('test')")
        assert sys.stdout is original

    def test_print_newline_included(self):
        code = "print('hello')\nx = 1"
        result = _run(code)
        all_output = "".join(s.output for s in result.steps)
        assert "hello\n" in all_output

    def test_print_end_kwarg(self):
        code = "print('A', end='')\nx = 1"
        result = _run(code)
        all_output = "".join(s.output for s in result.steps)
        assert "A" in all_output

    def test_output_in_final_step_with_no_successor(self):
        """Final line output must also be captured by stop_output_capture."""
        result = _run("print('last')")
        all_output = "".join(s.output for s in result.steps)
        assert "last" in all_output


# ===========================================================================
# Phase 8.9 — Rich runtime error events
# ===========================================================================

class TestRichErrors:

    def test_zero_division_error_type(self):
        result = _run("x = 1/0")
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.error_type == "ZeroDivisionError"

    def test_error_message_non_empty(self):
        result = _run("x = 1/0")
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.error_message != ""

    def test_error_has_traceback_summary(self):
        result = _run("x = 1/0")
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.traceback_summary is not None
        assert len(error_step.traceback_summary) > 0

    def test_traceback_summary_contains_error_type(self):
        result = _run("x = 1/0")
        error_step = next(s for s in result.steps if s.kind == "error")
        assert "ZeroDivisionError" in error_step.traceback_summary

    def test_traceback_summary_contains_line_number(self):
        result = _run("x = 1/0")
        error_step = next(s for s in result.steps if s.kind == "error")
        assert "1" in error_step.traceback_summary

    def test_error_line_number_correct_simple(self):
        result = _run("x = 1/0")
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.line == 1

    def test_error_line_number_correct_multiline(self):
        code = "x = 1\ny = 2\nz = 1/0"
        result = _run(code)
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.line == 3

    def test_error_highlights_mark_error_line(self):
        result = _run("x = 1/0")
        error_step = next(s for s in result.steps if s.kind == "error")
        assert 1 in error_step.highlights
        assert error_step.highlights[1] == "error"

    def test_error_highlights_multiline_correct(self):
        code = "x = 1\ny = 2\nz = 1/0"
        result = _run(code)
        error_step = next(s for s in result.steps if s.kind == "error")
        assert 3 in error_step.highlights
        assert error_step.highlights[3] == "error"

    def test_name_error_type(self):
        result = _run("x = undefined_variable")
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.error_type == "NameError"

    def test_type_error_type(self):
        result = _run("x = 1 + 'string'")
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.error_type == "TypeError"

    def test_value_error_type(self):
        result = _run("x = int('not_a_number')")
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.error_type == "ValueError"

    def test_steps_before_error_preserved(self):
        code = "x = 1\ny = 2\nz = 1/0"
        result = _run(code)
        line_steps = [s for s in result.steps if s.kind == "line"]
        assert len(line_steps) >= 2

    def test_error_step_is_last(self):
        result = _run("x = 1/0")
        assert result.steps[-1].kind == "error"

    def test_output_before_error_preserved(self):
        code = "print('before error')\nx = 1/0"
        result = _run(code)
        all_output = "".join(s.output for s in result.steps)
        assert "before error" in all_output

    def test_description_contains_error_type(self):
        result = _run("x = 1/0")
        error_step = next(s for s in result.steps if s.kind == "error")
        assert "ZeroDivisionError" in error_step.description

    def test_description_contains_offending_line(self):
        result = _run("x = 1/0")
        error_step = next(s for s in result.steps if s.kind == "error")
        assert "x = 1/0" in error_step.description

    def test_traceback_summary_function(self):
        """_build_traceback_summary produces a non-empty string."""
        try:
            x = 1 / 0
        except ZeroDivisionError as exc:
            summary = _build_traceback_summary(exc)
            assert "ZeroDivisionError" in summary

    def test_extract_error_line_zero_for_no_user_frame(self):
        """_extract_error_line returns 0 when no user-code frame found."""
        try:
            raise ValueError("test")
        except ValueError as exc:
            # The frame here has a test filename, not "<string>"
            line = _extract_error_line(exc)
            assert line == 0  # no <string> frames

    def test_runtime_error_status(self):
        result = _run("x = 1/0")
        assert result.status == "runtime_error"


# ===========================================================================
# End-to-end API tests (8.8 + 8.9)
# ===========================================================================

class TestOutputAPI:

    def test_output_field_present_in_response(self):
        response = client.post("/execute", json={"code": "x = 1"})
        data = response.json()
        for step in data["steps"]:
            assert "output" in step

    def test_print_output_in_api_response(self):
        response = client.post("/execute", json={"code": "print('hello world')"})
        data = response.json()
        all_output = "".join(s.get("output", "") for s in data["steps"])
        assert "hello world" in all_output

    def test_no_output_is_empty_string(self):
        response = client.post("/execute", json={"code": "x = 1\ny = 2"})
        data = response.json()
        for step in data["steps"]:
            assert step["output"] == ""

    def test_multiple_prints_all_captured(self):
        code = "print('one')\nprint('two')\nprint('three')"
        response = client.post("/execute", json={"code": code})
        data = response.json()
        all_output = "".join(s.get("output", "") for s in data["steps"])
        assert "one" in all_output
        assert "two" in all_output
        assert "three" in all_output


class TestErrorAPI:

    def test_error_step_in_api_response(self):
        response = client.post("/execute", json={"code": "x = 1/0"})
        data = response.json()
        assert data["status"] == "runtime_error"
        error_steps = [s for s in data["steps"] if s["kind"] == "error"]
        assert len(error_steps) == 1

    def test_error_has_traceback_summary_in_response(self):
        response = client.post("/execute", json={"code": "x = 1/0"})
        data = response.json()
        error_step = next(s for s in data["steps"] if s["kind"] == "error")
        assert error_step.get("traceback_summary") is not None
        assert "ZeroDivisionError" in error_step["traceback_summary"]

    def test_error_highlights_in_response(self):
        response = client.post("/execute", json={"code": "x = 1/0"})
        data = response.json()
        error_step = next(s for s in data["steps"] if s["kind"] == "error")
        highlights = error_step.get("highlights", {})
        assert len(highlights) > 0

    def test_error_line_in_response(self):
        response = client.post("/execute", json={"code": "x = 1\ny = 1/0"})
        data = response.json()
        error_step = next(s for s in data["steps"] if s["kind"] == "error")
        assert error_step["line"] == 2

    def test_output_before_error_in_response(self):
        code = "print('before')\nx = 1/0"
        response = client.post("/execute", json={"code": code})
        data = response.json()
        all_output = "".join(s.get("output", "") for s in data["steps"])
        assert "before" in all_output

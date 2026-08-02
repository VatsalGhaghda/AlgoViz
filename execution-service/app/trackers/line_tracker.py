"""
Line-by-line execution tracker — core sys.settrace hook.

Handles all three event kinds:
  "line"   -> RawLineEvent    (8.3)
  "call"   -> RawCallEvent    (8.5)
  "return" -> RawReturnEvent  (8.5)

Each event is enriched with:
  vars       : dict[str, VariableEntry]  (8.4  — VariableTracker)
  call_stack : list[StackFrame]          (8.6  — CallStackTracker)
  output     : str                       (8.8  — OutputTracker)

Phase 8.9: Rich error events are built by runner.py (not the tracer itself).
"""

from __future__ import annotations

import sys
import time
from dataclasses import dataclass, field
from types import FrameType
from typing import Any, Optional, Union

from app.schemas import VariableEntry, StackFrame
from app.trackers.variable_tracker import VariableTracker, _EXCLUDED_KEYS
from app.trackers.call_stack_tracker import CallStackTracker
from app.trackers.output_tracker import OutputTracker
from app.exceptions import ExecutionTimeout, TraceLimitReached


# ---------------------------------------------------------------------------
# Raw event types  (internal — converted to ExecutionStep by runner.py)
# ---------------------------------------------------------------------------

@dataclass
class RawLineEvent:
    """A source-line execution event."""
    line_no: int
    source_line: str
    vars: dict[str, VariableEntry] = field(default_factory=dict)   # 8.4
    call_stack: list[StackFrame] = field(default_factory=list)     # 8.6
    output: str = ""                                               # 8.8


@dataclass
class RawCallEvent:
    """A function-entry event."""
    line_no: int
    func_name: str
    args: dict[str, Any] = field(default_factory=dict)
    vars: dict[str, VariableEntry] = field(default_factory=dict)   # 8.4
    call_stack: list[StackFrame] = field(default_factory=list)     # 8.6
    output: str = ""                                               # 8.8


@dataclass
class RawReturnEvent:
    """A function-exit event."""
    line_no: int
    func_name: str
    return_value: Any = None
    vars: dict[str, VariableEntry] = field(default_factory=dict)   # 8.4
    call_stack: list[StackFrame] = field(default_factory=list)     # 8.6
    output: str = ""                                               # 8.8


# Union type used by runner._build_steps
RawEvent = Union[RawLineEvent, RawCallEvent, RawReturnEvent]


# ---------------------------------------------------------------------------
# LineTracker
# ---------------------------------------------------------------------------

class LineTracker:
    """
    Hooks sys.settrace to record all execution events, enriched with:
      - Variable snapshots   (VariableTracker)
      - Call stack snapshots (CallStackTracker)
      - Per-step output      (OutputTracker — managed by runner.py lifecycle)

    Usage (in runner.py):
        tracker = LineTracker(source=code, trace_limit=10_000)
        tracker.start_output_capture()          # redirect stdout/stderr
        sys.settrace(tracker.trace_calls)
        try:
            exec(compiled_code, namespace)
        except Exception as exc:
            ...
        finally:
            sys.settrace(None)
            tracker.stop_output_capture()       # restore stdout/stderr + final flush
    """

    USER_CODE_FILENAME = "<string>"

    def __init__(
        self,
        source: str,
        trace_limit: int = 10_000,
        capture_output: bool = True,
        timeout_seconds: float = 0.0,   # 0 = disabled
    ) -> None:
        self._source_lines: list[str] = source.splitlines()
        self._trace_limit: int = trace_limit
        self._timeout_seconds: float = timeout_seconds
        self._start_time: float = 0.0   # set in trace_calls on first event

        self.events: list[RawEvent] = []
        self.limit_reached: bool = False
        self.timeout_reached: bool = False

        self._var_tracker = VariableTracker()
        self._call_stack = CallStackTracker()
        self._output_tracker: Optional[OutputTracker] = (
            OutputTracker() if capture_output else None
        )

    # ------------------------------------------------------------------ #
    # Output capture lifecycle (called by runner.py)                       #
    # ------------------------------------------------------------------ #

    def start_output_capture(self) -> None:
        """Redirect sys.stdout/stderr to the internal buffer. Call BEFORE exec()."""
        if self._output_tracker:
            self._output_tracker.start()

    def stop_output_capture(self) -> None:
        """
        Drain any remaining buffer content into the last event, then restore streams.
        Always call in a finally block so stdout is never left redirected.
        """
        if self._output_tracker:
            final_output = self._output_tracker.flush()
            if final_output and self.events:
                self.events[-1].output += final_output
            self._output_tracker.stop()

    # ------------------------------------------------------------------ #
    # Helpers                                                              #
    # ------------------------------------------------------------------ #

    def get_source_line(self, line_no: int) -> str:
        """Return the raw source text at 1-indexed line_no. Empty if OOB."""
        idx = line_no - 1
        return self._source_lines[idx] if 0 <= idx < len(self._source_lines) else ""

    def _append(self, event: RawEvent) -> None:
        """
        Append an event and immediately raise TraceLimitReached once the
        hard limit is reached.

        Raising stops execution deterministically — no waiting for timeout —
        and guarantees the events list never exceeds self._trace_limit entries.
        """
        self.events.append(event)
        if len(self.events) >= self._trace_limit:
            self.limit_reached = True
            raise TraceLimitReached(self._trace_limit)

    def _flush_output_to_prev(self) -> None:
        """
        Drain the output buffer and attribute the content to the PREVIOUS event.

        Timing: a "line N" event fires BEFORE line N runs, which means any output
        in the buffer at that moment was produced by line N-1's execution.
        Attributing to events[-1] is therefore correct.
        """
        if not self._output_tracker:
            return
        captured = self._output_tracker.flush()
        if captured and self.events:
            self.events[-1].output += captured

    # ------------------------------------------------------------------ #
    # sys.settrace callback                                                #
    # ------------------------------------------------------------------ #

    def trace_calls(
        self,
        frame: FrameType,
        event: str,
        arg: Any,
    ) -> Optional["LineTracker.trace_calls"]:  # type: ignore[return]
        """
        sys.settrace callback. Only processes frames from user-submitted code.
        Returns None once trace_limit or timeout is reached.
        Raises ExecutionTimeout(BaseException) if timeout_seconds is exceeded.
        """
        if frame.f_code.co_filename != self.USER_CODE_FILENAME:
            return self.trace_calls

        # Phase 8.10 — record start time on first event, check on every subsequent event
        now = time.monotonic()
        if self._start_time == 0.0:
            self._start_time = now
        elif (
            self._timeout_seconds > 0.0
            and (now - self._start_time) > self._timeout_seconds
        ):
            self.timeout_reached = True
            raise ExecutionTimeout(self._timeout_seconds)

        if self.limit_reached:
            return None

        if event == "line":
            self._handle_line(frame)
        elif event == "call":
            self._handle_call(frame)
        elif event == "return":
            self._handle_return(frame, arg)

        # _append raises TraceLimitReached once the budget is exhausted;
        # if limit_reached was set by the raise path above, stop tracing.
        return None if self.limit_reached else self.trace_calls

    # ------------------------------------------------------------------ #
    # Event handlers                                                       #
    # ------------------------------------------------------------------ #

    def _handle_line(self, frame: FrameType) -> None:
        """A new source line is about to execute."""
        line_no = frame.f_lineno
        self._call_stack.update_top_line(line_no)

        # Output in buffer now was produced by the PREVIOUS step's line
        self._flush_output_to_prev()

        self._append(RawLineEvent(
            line_no=line_no,
            source_line=self.get_source_line(line_no),
            vars=self._var_tracker.capture(frame),
            call_stack=self._call_stack.snapshot(),
        ))

    def _handle_call(self, frame: FrameType) -> None:
        """A user-code function is being entered."""
        func_name = frame.f_code.co_name
        line_no = frame.f_lineno

        # Skip the <module>-level call event (Python 3.14 fires it for exec() entry)
        if func_name == "<module>":
            return

        # Flush output produced between the call-site line and this call event
        self._flush_output_to_prev()

        self._call_stack.push(func_name=func_name, line_no=line_no)

        args: dict[str, Any] = {
            k: v for k, v in frame.f_locals.items()
            if k not in _EXCLUDED_KEYS
        }

        self._append(RawCallEvent(
            line_no=line_no,
            func_name=func_name,
            args=args,
            vars=self._var_tracker.capture(frame),
            call_stack=self._call_stack.snapshot(),
        ))

    def _handle_return(self, frame: FrameType, return_value: Any) -> None:
        """A user-code function is exiting."""
        func_name = frame.f_code.co_name
        line_no = frame.f_lineno

        # Skip <module>-level return (paired with filtered call above)
        if func_name == "<module>":
            return

        # Flush any output produced inside the function before this return event
        self._flush_output_to_prev()

        # Snapshot before popping (stack still includes this frame)
        vars_snapshot = self._var_tracker.capture(frame)
        stack_snapshot = self._call_stack.snapshot()
        self._call_stack.pop()

        self._append(RawReturnEvent(
            line_no=line_no,
            func_name=func_name,
            return_value=return_value,
            vars=vars_snapshot,
            call_stack=stack_snapshot,
        ))

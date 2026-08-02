"""
Call stack tracker — maintains a live stack of StackFrame objects.

Pushed on every "call" event, popped on every "return" event.
A snapshot is attached to every trace event so the frontend always knows
exactly which function calls are currently in progress.

Phase 8.6: Call stack tracking.
"""

from __future__ import annotations

from typing import Optional

from app.schemas import StackFrame


class CallStackTracker:
    """
    Maintains an ordered list of StackFrame objects representing the live call stack.

    Convention: bottom-to-top — index 0 is the outermost frame (module scope),
    last index is the most deeply nested call currently executing.
    This matches the convention in shared/types/execution.ts StackFrame[].

    Usage:
        tracker = CallStackTracker()
        tracker.push(func_name="add", line_no=1)
        snapshot = tracker.snapshot()   # [StackFrame(func_name="add", line_no=1)]
        tracker.pop()
    """

    # Filename used when compiling user code (matches LineTracker.USER_CODE_FILENAME)
    USER_CODE_FILENAME = "<string>"

    def __init__(self) -> None:
        self._stack: list[StackFrame] = []

    # ------------------------------------------------------------------ #
    # Stack operations                                                     #
    # ------------------------------------------------------------------ #

    def push(
        self,
        func_name: str,
        line_no: int,
        filename: str = USER_CODE_FILENAME,
    ) -> None:
        """Push a new frame onto the call stack."""
        self._stack.append(StackFrame(
            func_name=func_name,
            line_no=line_no,
            filename=filename,
        ))

    def pop(self) -> Optional[StackFrame]:
        """Pop the top frame from the call stack. Returns None if already empty."""
        return self._stack.pop() if self._stack else None

    def update_top_line(self, line_no: int) -> None:
        """
        Update the line number on the top frame.
        Called on each "line" event so the stack snapshot reflects the current line.
        """
        if self._stack:
            top = self._stack[-1]
            self._stack[-1] = StackFrame(
                func_name=top.func_name,
                line_no=line_no,
                filename=top.filename,
            )

    # ------------------------------------------------------------------ #
    # Read operations                                                      #
    # ------------------------------------------------------------------ #

    def snapshot(self) -> list[StackFrame]:
        """Return an immutable copy of the current call stack (bottom-to-top)."""
        return list(self._stack)

    @property
    def depth(self) -> int:
        """Current call stack depth (0 = module scope, no function calls active)."""
        return len(self._stack)

    def is_empty(self) -> bool:
        return len(self._stack) == 0

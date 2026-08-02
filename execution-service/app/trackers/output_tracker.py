"""
Output tracker — captures sys.stdout/sys.stderr output per execution step.

Redirects both streams to a shared in-memory buffer during exec().
The LineTracker calls flush() at each trace event to drain and attribute
the output produced since the previous step.

Phase 8.7: Create OutputTracker with start/flush/stop lifecycle.
Phase 8.8: LineTracker calls flush() at each event; runner.py uses stop() in finally.
"""

from __future__ import annotations

import sys
from io import StringIO
from typing import Optional


class OutputTracker:
    """
    Redirects sys.stdout and sys.stderr to an in-memory StringIO buffer.

    Lifecycle (managed by runner.py):
        tracker.start_output_capture()   # before exec()
        ...exec() runs, LineTracker calls _flush_output_to_prev() at each event...
        tracker.stop_output_capture()    # in finally block — captures remainder + restores

    Safety:
        stop_output_capture() is idempotent — calling it multiple times is safe.
        If start() was never called, flush() returns "" and stop() is a no-op.

    Limits:
        Per-flush output is capped at MAX_OUTPUT_BYTES to prevent memory abuse.
    """

    MAX_OUTPUT_BYTES: int = 10_240  # 10 KB per-flush limit

    def __init__(self) -> None:
        self._buffer: StringIO = StringIO()
        self._original_stdout: Optional[object] = None
        self._original_stderr: Optional[object] = None
        self._active: bool = False

    # ------------------------------------------------------------------ #
    # Lifecycle                                                            #
    # ------------------------------------------------------------------ #

    def start(self) -> None:
        """Redirect sys.stdout and sys.stderr to the internal buffer."""
        self._original_stdout = sys.stdout
        self._original_stderr = sys.stderr
        sys.stdout = self._buffer   # type: ignore[assignment]
        sys.stderr = self._buffer   # type: ignore[assignment]
        self._active = True

    def flush(self) -> str:
        """
        Drain and return all content written to the buffer since the last flush.

        Always returns a str (never raises). Truncates to MAX_OUTPUT_BYTES.
        """
        if not self._active:
            return ""
        content = self._buffer.getvalue()
        # Reset buffer in-place (truncate to 0, seek back to start)
        self._buffer.truncate(0)
        self._buffer.seek(0)
        if len(content) > self.MAX_OUTPUT_BYTES:
            content = content[: self.MAX_OUTPUT_BYTES] + "\n... (output truncated)"
        return content

    def stop(self) -> None:
        """
        Restore sys.stdout and sys.stderr. Idempotent — safe to call multiple times.
        """
        if self._active:
            sys.stdout = self._original_stdout  # type: ignore[assignment]
            sys.stderr = self._original_stderr  # type: ignore[assignment]
            self._active = False

"""
Custom exceptions for the AlgoVisualizer execution service.

Using BaseException (not Exception) for ExecutionTimeout so it cannot be
caught by user code with bare `except Exception:` clauses.
"""

from __future__ import annotations


class ExecutionTimeout(BaseException):
    """
    Raised when user code execution exceeds the configured timeout.

    Extends BaseException intentionally so that user code with:
        try:
            ...
        except Exception:
            ...
    cannot suppress the timeout signal.

    The runner catches this class explicitly (not via bare `except Exception`).
    """

    def __init__(self, seconds: float) -> None:
        super().__init__(f"Execution timed out after {seconds}s")
        self.seconds = seconds


class TraceLimitReached(BaseException):
    """
    Raised immediately when the execution trace accumulates more events than the
    configured trace_limit.

    Extends BaseException for the same reason as ExecutionTimeout — user code
    with bare `except Exception:` clauses must not be able to catch and suppress
    this signal, which would allow unlimited execution.

    The runner catches this class explicitly and returns a 'trace_limit_reached'
    status with a clear error message.  This guarantees that the total number of
    returned steps never exceeds trace_limit.
    """

    def __init__(self, limit: int) -> None:
        super().__init__(f"Trace limit of {limit:,} steps reached")
        self.limit = limit


class SandboxViolation(Exception):
    """
    Raised when user code attempts a disallowed operation.

    Examples:
      - Accessing a blocked builtin (open, exec, eval, ...)
      - Importing a disallowed module (socket, subprocess, ...)

    Phase 8.11: Currently used for blocked-builtin access reports.
    Phase 8.11b (Docker sandbox): Extended to cover process-level violations.
    """
    pass

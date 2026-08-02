"""
Execution runner — orchestrates parsing, tracing, and step generation.

Phase progression:
  8.3  Lines: step_index, line, kind, description, highlights
  8.4  + vars snapshot per step
  8.5  + call/return events
  8.6  + call_stack snapshot per step
  8.7  + OutputTracker redirects stdout/stderr
  8.8  + per-step output field populated from OutputTracker
  8.9  + rich RuntimeErrorEvent with traceback_summary and highlights
  8.10 + ExecutionTimeout(BaseException) raised from trace callback (no infinite loops)
  8.11 + namespace parameter — SandboxManager passes restricted builtins
"""

from __future__ import annotations

import ast
import sys
from dataclasses import dataclass

from app.schemas import ExecutionStep, ExecutionStatus
from app.exceptions import ExecutionTimeout, TraceLimitReached
from app.trackers.line_tracker import (
    LineTracker,
    RawLineEvent,
    RawCallEvent,
    RawReturnEvent,
    RawEvent,
)
from app.trackers.variable_tracker import serialize_value


# ---------------------------------------------------------------------------
# Configuration & result types
# ---------------------------------------------------------------------------

@dataclass
class RunConfig:
    """Configuration for a single execution run."""
    trace_limit: int = 10_000
    timeout_seconds: int = 5


@dataclass
class RunResult:
    """The canonical output of runner.run()."""
    steps: list[ExecutionStep]
    status: ExecutionStatus
    truncated: bool = False


# ---------------------------------------------------------------------------
# Core runner
# ---------------------------------------------------------------------------

def run(
    source: str,
    tree: ast.Module,
    config: RunConfig,
    namespace: dict | None = None,
) -> RunResult:
    """
    Execute user-submitted Python code and return a canonical execution trace.

    Args:
        source:    Original source string (for readable source lines + error context).
        tree:      Pre-parsed ast.Module (guaranteed valid by the caller).
        config:    Execution configuration (trace_limit, timeout_seconds).
        namespace: Execution namespace dict. If None, uses full builtins (testing only).
                   Production calls via SandboxManager always supply a restricted namespace.

    Returns:
        RunResult with ordered ExecutionStep list and status.

    Safety invariants:
        sys.settrace is ALWAYS unset in the finally block.
        sys.stdout/stderr are ALWAYS restored in the finally block.
    """
    # --- 1. Compile AST ---
    try:
        code = compile(tree, "<string>", "exec")
    except Exception as exc:
        error_step = ExecutionStep(
            step_index=0, line=0, kind="error",
            description=f"Compilation failed: {exc}",
            error_type=type(exc).__name__,
            error_message=str(exc),
            traceback_summary=str(exc),
        )
        return RunResult(steps=[error_step], status="runtime_error")

    # --- 2. Set up tracer (includes OutputTracker + timeout) ---
    tracker = LineTracker(
        source=source,
        trace_limit=config.trace_limit,
        timeout_seconds=float(config.timeout_seconds),
    )

    # --- 3. Execution namespace ---
    # If no namespace supplied (tests / dev), fall back to full builtins.
    # Production path: SandboxManager always supplies a restricted namespace.
    exec_namespace = namespace if namespace is not None else {
        "__name__": "__main__",
        "__builtins__": __builtins__,
    }

    # --- 4. Execute with tracing + output capture ---
    execution_exception: Exception | None = None
    execution_timed_out: bool = False
    execution_limit_reached: bool = False

    tracker.start_output_capture()
    sys.settrace(tracker.trace_calls)
    try:
        exec(code, exec_namespace)          # noqa: S102
    except TraceLimitReached:
        # TraceLimitReached is a BaseException raised by _append the instant
        # the trace buffer is full.  Mark the flag; do NOT treat as timeout.
        execution_limit_reached = True
    except ExecutionTimeout:
        # Phase 8.10: timeout — BaseException, not caught by `except Exception`
        execution_timed_out = True
    except Exception as exc:
        execution_exception = exc
    finally:
        sys.settrace(None)                  # ALWAYS unset
        tracker.stop_output_capture()       # ALWAYS restore stdout/stderr

    # --- 5. Convert raw events -> canonical ExecutionStep objects ---
    steps = _build_steps(tracker.events)

    # --- 6. Trace limit handling (checked BEFORE timeout) ---
    # TraceLimitReached stops execution immediately via BaseException, so this
    # path is mutually exclusive with the timeout path in practice.  We still
    # check limit first so that a program that manages to hit both (e.g., an
    # infinite loop that coincidentally exhausts the trace budget right at the
    # timeout boundary) is categorised correctly.
    if execution_limit_reached or tracker.limit_reached:
        # Cap real steps to trace_limit - 1 to leave exactly one slot for the
        # limit error step, guaranteeing the total never exceeds trace_limit.
        safe_steps = steps[: config.trace_limit - 1]
        last_line = safe_steps[-1].line if safe_steps else 0
        limit_step = ExecutionStep(
            step_index=len(safe_steps),
            line=last_line,
            kind="error",   # treated as error so the frontend ErrorBanner shows it
            description=(
                f"Execution stopped: trace limit of {config.trace_limit:,} steps reached. "
                "Try a smaller input or avoid unbounded loops."
            ),
            error_type="TraceLimitReached",
            error_message=(
                f"Maximum execution step limit of {config.trace_limit:,} reached. "
                "This often indicates an infinite loop or very long computation."
            ),
            highlights={last_line: "error"} if last_line > 0 else {},
        )
        safe_steps.append(limit_step)
        return RunResult(steps=safe_steps, status="trace_limit_reached", truncated=True)

    # --- 7. Timeout handling ---
    if execution_timed_out:
        timeout_step = ExecutionStep(
            step_index=len(steps),
            line=steps[-1].line if steps else 0,
            kind="timeout",
            description=(
                f"Execution timed out after {config.timeout_seconds}s. "
                "Possible infinite loop or very slow code."
            ),
            highlights={steps[-1].line: "timeout"} if steps else {},
        )
        steps.append(timeout_step)
        return RunResult(steps=steps, status="timeout", truncated=True)

    # --- 8. Runtime error handling (Phase 8.9) ---
    if execution_exception is not None:
        error_step = _build_error_step(execution_exception, steps, source)
        steps.append(error_step)
        return RunResult(steps=steps, status="runtime_error", truncated=False)

    return RunResult(steps=steps, status="completed", truncated=False)


# ---------------------------------------------------------------------------
# Step builder (8.3–8.8)
# ---------------------------------------------------------------------------

def _build_steps(events: list[RawEvent]) -> list[ExecutionStep]:
    """Convert the mixed RawEvent list into canonical ExecutionStep objects."""
    steps: list[ExecutionStep] = []

    for raw in events:

        if isinstance(raw, RawLineEvent):
            if raw.line_no == 0:
                continue
            step = ExecutionStep(
                step_index=len(steps),
                line=raw.line_no,
                kind="line",
                description=_describe_line(raw.line_no, raw.source_line),
                vars=raw.vars,
                call_stack=raw.call_stack,
                output=raw.output,
                highlights={raw.line_no: "active"},
            )

        elif isinstance(raw, RawCallEvent):
            serialized_args = {k: serialize_value(v) for k, v in (raw.args or {}).items()}
            args_str = ", ".join(
                f"{k}={_compact(v)}" for k, v in (raw.args or {}).items()
            )
            step = ExecutionStep(
                step_index=len(steps),
                line=raw.line_no,
                kind="call",
                description=f"Calling {raw.func_name}({args_str})",
                func_name=raw.func_name,
                args=serialized_args,
                vars=raw.vars,
                call_stack=raw.call_stack,
                output=raw.output,
                highlights={raw.line_no: "active"},
            )

        elif isinstance(raw, RawReturnEvent):
            serialized_return = serialize_value(raw.return_value)
            step = ExecutionStep(
                step_index=len(steps),
                line=raw.line_no,
                kind="return",
                description=f"Returning {_compact(raw.return_value)} from {raw.func_name}",
                func_name=raw.func_name,
                return_value=serialized_return,
                vars=raw.vars,
                call_stack=raw.call_stack,
                output=raw.output,
                highlights={raw.line_no: "active"},
            )

        else:
            continue

        steps.append(step)

    return steps


# ---------------------------------------------------------------------------
# Phase 8.9 — Rich runtime error event
# ---------------------------------------------------------------------------

def _build_error_step(
    exc: Exception,
    steps: list[ExecutionStep],
    source: str,
) -> ExecutionStep:
    """Build a rich RuntimeErrorEvent ExecutionStep from a runtime exception."""
    error_line = _extract_error_line(exc)
    source_lines = source.splitlines()

    offending = ""
    if error_line > 0 and error_line <= len(source_lines):
        offending = source_lines[error_line - 1].strip()

    error_type = type(exc).__name__
    error_msg = str(exc)

    parts = [f"{error_type}: {error_msg}"]
    if offending:
        parts.append(f"  (line {error_line}: {offending})")
    description = "".join(parts)

    highlights = {error_line: "error"} if error_line > 0 else {}
    fallback_line = steps[-1].line if steps else 0

    return ExecutionStep(
        step_index=len(steps),
        line=error_line if error_line > 0 else fallback_line,
        kind="error",
        description=description,
        error_type=error_type,
        error_message=error_msg,
        traceback_summary=_build_traceback_summary(exc),
        highlights=highlights,
    )


def _build_traceback_summary(exc: Exception) -> str:
    """Concise traceback limited to user-code frames (filename == '<string>')."""
    frames: list[str] = []
    tb = exc.__traceback__
    while tb is not None:
        frame = tb.tb_frame
        if frame.f_code.co_filename == "<string>":
            func = frame.f_code.co_name
            lineno = tb.tb_lineno
            frames.append(f"  line {lineno}, in {func}")
        tb = tb.tb_next

    error_type = type(exc).__name__
    error_msg = str(exc)

    if frames:
        body = "\n".join(frames)
        return f"Traceback (user code):\n{body}\n{error_type}: {error_msg}"
    return f"{error_type}: {error_msg}"


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _describe_line(line_no: int, source_line: str) -> str:
    stripped = source_line.strip()
    return f"Executing line {line_no}: {stripped}" if stripped else f"Executing line {line_no}"


def _compact(value: object, max_len: int = 40) -> str:
    try:
        r = repr(value)
        return r[:max_len] + "..." if len(r) > max_len else r
    except Exception:
        return "<value>"


def _extract_error_line(exc: Exception) -> int:
    """Extract the deepest user-code line number from an exception's traceback."""
    tb = exc.__traceback__
    last_lineno = 0
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == "<string>":
            last_lineno = tb.tb_lineno
        tb = tb.tb_next
    return last_lineno

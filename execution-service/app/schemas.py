"""
Canonical Pydantic schemas for the AlgoVisualizer execution service.

These schemas define the contract between the Express backend and this service.
The TypeScript mirror lives in: shared/types/execution.ts
"""

from __future__ import annotations
from typing import Any, Literal, Optional, Union
from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------

class ExecutionRequest(BaseModel):
    """Payload sent by the Express backend to POST /execute."""

    code: str = Field(
        ...,
        description="Python source code to execute.",
        min_length=1,
        max_length=51_200,  # 50 KB hard limit
    )
    trace_limit: int = Field(
        default=10_000,
        ge=100,
        le=50_000,
        description=(
            "Maximum number of ExecutionStep objects to collect. "
            "Default: 10,000. Hard max enforced: 50,000."
        ),
    )
    timeout_seconds: int = Field(
        default=5,
        ge=1,
        le=10,
        description="Execution timeout in seconds.",
    )

    @field_validator("code")
    @classmethod
    def strip_null_bytes(cls, v: str) -> str:
        """Remove null bytes that could cause issues in exec()."""
        return v.replace("\x00", "")


# ---------------------------------------------------------------------------
# Shared sub-objects
# ---------------------------------------------------------------------------

class VariableEntry(BaseModel):
    """A single variable snapshot at a given execution step."""

    name: str
    value: Any
    type: str = Field(
        description="Python type name: int, float, str, bool, list, dict, set, tuple, NoneType, unknown"
    )
    changed: bool = Field(
        default=False,
        description="True if the variable was created or updated at this step.",
    )
    scope: Literal["local", "global"] = "local"


class StackFrame(BaseModel):
    """A single frame in the call stack snapshot."""

    func_name: str
    line_no: int
    filename: str = "<string>"


# ---------------------------------------------------------------------------
# Execution step kinds
# ---------------------------------------------------------------------------

StepKind = Literal["line", "call", "return", "error", "limit", "timeout"]

ExecutionStatus = Literal[
    "completed",
    "syntax_error",
    "runtime_error",
    "trace_limit_reached",
    "timeout",
    "sandbox_error",
]


class ExecutionStep(BaseModel):
    """
    A single step in the canonical execution trace.

    Field names are aligned with the frontend's VisualizationStep interface
    wherever possible to maximise reuse in the playback engine.
    """

    step_index: int = Field(description="0-based monotonically increasing index.")
    line: int = Field(description="1-indexed source line number.")
    kind: StepKind
    description: str = Field(
        description="Human-readable explanation of what happened at this step."
    )
    vars: dict[str, VariableEntry] = Field(
        default_factory=dict,
        description="Variable snapshot keyed by variable name.",
    )
    call_stack: list[StackFrame] = Field(
        default_factory=list,
        description="Call stack snapshot (bottom-to-top order).",
    )
    output: str = Field(
        default="",
        description="Console output produced at this exact step (may be empty).",
    )
    highlights: dict[int, str] = Field(
        default_factory=dict,
        description="Map of {line_no: highlight_state} for editor decoration.",
    )
    # Optional fields present only on specific step kinds
    func_name: Optional[str] = None       # call / return steps
    args: Optional[dict[str, Any]] = None  # call steps
    return_value: Optional[Any] = None    # return steps
    error_type: Optional[str] = None      # error steps
    error_message: Optional[str] = None   # error steps
    traceback_summary: Optional[str] = None  # error steps


# ---------------------------------------------------------------------------
# Response
# ---------------------------------------------------------------------------

class ExecutionResponse(BaseModel):
    """Response returned by POST /execute."""

    steps: list[ExecutionStep] = Field(default_factory=list)
    status: ExecutionStatus = "completed"
    total_steps: int = Field(
        description="Number of steps in this response (len(steps))."
    )
    truncated: bool = Field(
        default=False,
        description="True when trace_limit was reached and steps were cut off.",
    )

    @classmethod
    def empty(cls) -> "ExecutionResponse":
        """Stub response used during Phase 8.1 before the engine is built."""
        return cls(steps=[], status="completed", total_steps=0)

    @classmethod
    def syntax_error(
        cls,
        message: str,
        line: int = 0,
        col: int = 0,
    ) -> "ExecutionResponse":
        """Response for a syntax error detected before execution."""
        step = ExecutionStep(
            step_index=0,
            line=line,
            kind="error",
            description=f"SyntaxError at line {line}, col {col}: {message}",
            error_type="SyntaxError",
            error_message=message,
            highlights={line: "error"} if line > 0 else {},
        )
        return cls(steps=[step], status="syntax_error", total_steps=1)

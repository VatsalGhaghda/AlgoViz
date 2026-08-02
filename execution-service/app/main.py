import os

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from app.schemas import ExecutionRequest, ExecutionResponse
from app.parser import parse
from app.executor.runner import RunConfig
from app.sandbox.manager import SandboxManager

app = FastAPI(
    title="AlgoVisualizer Execution Service",
    description=(
        "Internal Python execution engine. "
        "This service is NOT publicly exposed — all requests must arrive via the Express backend."
    ),
    version="0.4.0",
)

BACKEND_ORIGIN = os.getenv("BACKEND_ORIGIN", "http://localhost:5000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[BACKEND_ORIGIN],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Phase 8.11: single sandbox instance — stateless so safe to reuse across requests
_sandbox: SandboxManager = SandboxManager.create_default()


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health", tags=["monitoring"])
def health_check():
    """Liveness probe — confirms the service is up."""
    return {"status": "success", "message": "Execution service is running"}


# ---------------------------------------------------------------------------
# Execute endpoint
# ---------------------------------------------------------------------------

@app.post("/execute", response_model=ExecutionResponse, tags=["execution"])
async def execute_code(request: ExecutionRequest) -> ExecutionResponse:
    """
    Accept Python source code and return a canonical execution trace.

    Phase 8.2: Syntax error detection via ast.parse().
    Phase 8.3: Real line-by-line execution trace via sys.settrace().
    Phase 8.4: Variable snapshots with change detection.
    Phase 8.5: Function call/return events.
    Phase 8.6: Call stack snapshot per step.
    Phase 8.7/8.8: Per-step stdout/stderr output capture.
    Phase 8.9: Rich runtime error events with traceback_summary.
    Phase 8.10: Execution timeout via ExecutionTimeout(BaseException).
    Phase 8.11: InProcessSandbox — restricted builtins + module blocklist.
    """
    # --- Phase 8.2: AST parse — syntax errors exit here ---
    parse_result = parse(request.code)

    if not parse_result.success:
        err = parse_result.error
        return ExecutionResponse.syntax_error(
            message=err.message if err else "Unknown syntax error",
            line=err.line if err else 0,
            col=err.col if err else 0,
        )

    # --- Phase 8.11: Execute in sandbox ---
    config = RunConfig(
        trace_limit=request.trace_limit,
        timeout_seconds=request.timeout_seconds,
    )
    result = _sandbox.execute(
        source=request.code,
        tree=parse_result.tree,     # type: ignore[arg-type]
        config=config,
    )

    return ExecutionResponse(
        steps=result.steps,
        status=result.status,
        total_steps=len(result.steps),
        truncated=result.truncated,
    )


# ---------------------------------------------------------------------------
# Validation error handler
# ---------------------------------------------------------------------------

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": "Validation error", "detail": exc.errors()},
    )

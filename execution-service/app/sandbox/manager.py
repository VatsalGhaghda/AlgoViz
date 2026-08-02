"""
SandboxManager — abstract base class for all sandbox implementations.

Design principles (per Phase 8.11 requirements):
  - One isolated execution environment per user request
  - CPU limits (via timeout in LineTracker — Phase 8.10)
  - Trace step limits (LineTracker trace_limit)
  - Per-instance cleanup (stateless — no shared state between calls)
  - Modular: swap InProcessSandbox for DockerSandbox without changing callers

Extension points (future phases):
  - DockerSandbox: per-container isolation, memory limits, no network, read-only FS
  - gVisorSandbox: gVisor-based kernel-level isolation
  - The factory method `create_default()` determines which backend is active.
"""

from __future__ import annotations

import ast
from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.executor.runner import RunConfig, RunResult


class SandboxManager(ABC):
    """
    Abstract base class for sandbox execution environments.

    All methods are stateless with respect to the sandbox state — each
    `execute()` call is fully isolated from previous calls. Any per-call
    setup/teardown is handled internally by the implementation.

    Implementations must guarantee:
      - stdout/stderr are restored after execute() returns (success or error)
      - sys.settrace is unset after execute() returns
      - No mutable state is shared between concurrent execute() calls
    """

    @abstractmethod
    def execute(
        self,
        source: str,
        tree: ast.Module,
        config: "RunConfig",
    ) -> "RunResult":
        """
        Execute user-submitted Python code in this sandbox.

        Args:
            source: Original source string (for readable traces + error messages).
            tree:   Pre-parsed ast.Module — caller guarantees success=True.
            config: Execution configuration (trace_limit, timeout_seconds).

        Returns:
            RunResult with ordered ExecutionStep list and canonical status.
        """
        ...

    # ------------------------------------------------------------------ #
    # Factory                                                              #
    # ------------------------------------------------------------------ #

    @classmethod
    def create_default(cls) -> "SandboxManager":
        """
        Factory method: create the default sandbox for the current environment.

        Current default: InProcessSandbox (Phase 8.11).
        Future: DockerSandbox when container runtime is available.

        This is the single place to swap sandbox backends without touching
        any calling code (main.py, tests, etc.).
        """
        from app.sandbox.in_process import InProcessSandbox
        return InProcessSandbox()

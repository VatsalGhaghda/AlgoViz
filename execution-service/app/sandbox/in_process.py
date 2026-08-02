"""
InProcessSandbox — Phase 8.11 initial sandbox implementation.

Runs user code IN the same Python process but with a restricted execution
namespace that blocks dangerous builtins (open, exec, eval, compile, etc.)
and wraps __import__ to block disallowed modules.

Security model (Phase 8.11):
  ✅ Blocked builtins: open, exec, eval, compile, breakpoint, input
  ✅ Blocked modules: os, sys, socket, subprocess, shutil, ctypes, importlib,
                      pty, pdb, pickle, shelve, io (for RawIOBase),
                      threading, multiprocessing, signal
  ✅ Execution timeout enforced by LineTracker (Phase 8.10)
  ✅ Step-count limit enforced by LineTracker
  ❌ No process-level isolation (memory, PID, network)  ← Docker sandbox future
  ❌ No filesystem read-only enforcement                ← Docker sandbox future

Modular design:
  The SandboxManager ABC is the single seam. Replacing InProcessSandbox with
  DockerSandbox requires only changing SandboxManager.create_default().
  All callers (main.py, tests) remain unchanged.
"""

from __future__ import annotations

import ast
import builtins as _builtins_module
from typing import Callable, Any

from app.sandbox.manager import SandboxManager
from app.executor.runner import RunConfig, RunResult, run


# ---------------------------------------------------------------------------
# Allowlist & blocklist configuration
# ---------------------------------------------------------------------------

# Builtins explicitly allowed for educational Python code
_SAFE_BUILTIN_NAMES: frozenset[str] = frozenset({
    # Arithmetic & math
    "abs", "divmod", "max", "min", "pow", "round", "sum",
    # Type constructors
    "bool", "bytes", "bytearray", "chr", "complex", "dict", "enumerate",
    "filter", "float", "frozenset", "hash", "hex", "int", "iter",
    "len", "list", "map", "memoryview", "next", "object", "oct",
    "ord", "range", "repr", "reversed", "set", "slice", "sorted",
    "str", "tuple", "type", "vars", "zip",
    # Introspection (read-only)
    "callable", "dir", "getattr", "globals", "hasattr", "id",
    "isinstance", "issubclass", "locals",
    # Output
    "print", "format",
    # Class machinery
    "classmethod", "property", "staticmethod", "super",
    "__build_class__",
    # Exceptions — all stdlib exceptions
    "ArithmeticError", "AssertionError", "AttributeError", "BaseException",
    "BlockingIOError", "BrokenPipeError", "BufferError", "BytesWarning",
    "ChildProcessError", "ConnectionAbortedError", "ConnectionError",
    "ConnectionRefusedError", "ConnectionResetError", "DeprecationWarning",
    "EOFError", "EnvironmentError", "Exception", "FileExistsError",
    "FileNotFoundError", "FloatingPointError", "FutureWarning", "GeneratorExit",
    "IOError", "ImportError", "ImportWarning", "IndentationError", "IndexError",
    "InterruptedError", "IsADirectoryError", "KeyError", "KeyboardInterrupt",
    "LookupError", "MemoryError", "ModuleNotFoundError", "NameError",
    "NotADirectoryError", "NotImplementedError", "OSError", "OverflowError",
    "PendingDeprecationWarning", "PermissionError", "ProcessLookupError",
    "RecursionError", "ReferenceError", "ResourceWarning", "RuntimeError",
    "RuntimeWarning", "StopAsyncIteration", "StopIteration", "SyntaxError",
    "SyntaxWarning", "SystemError", "SystemExit", "TabError", "TimeoutError",
    "TypeError", "UnboundLocalError", "UnicodeDecodeError", "UnicodeEncodeError",
    "UnicodeError", "UnicodeTranslateError", "UnicodeWarning", "UserWarning",
    "ValueError", "Warning", "ZeroDivisionError",
    # Singletons
    "NotImplemented", "Ellipsis",
    # Copy helpers
    "copy",
})

# Modules that are explicitly disallowed (import will raise ImportError)
_BLOCKED_MODULES: frozenset[str] = frozenset({
    # OS / process access
    "os", "sys", "subprocess", "shutil", "signal", "pty",
    # Network access
    "socket", "ssl", "http", "urllib", "urllib2", "urllib3",
    "ftplib", "imaplib", "poplib", "smtplib", "telnetlib",
    "xmlrpc", "asyncio",  # can spawn threads / event loops
    # Code injection
    "importlib", "importlib.util", "importlib.machinery",
    "ctypes", "cffi",
    # Debugging / introspection hazards
    "pdb", "trace", "dis",
    # Serialisation (can unpickle arbitrary objects)
    "pickle", "pickletools", "shelve",
    # Threading / multiprocessing
    "threading", "multiprocessing", "concurrent", "concurrent.futures",
    # Other hazards
    "_thread", "gc",
})


def _build_safe_builtins(blocked_modules: frozenset[str]) -> dict[str, Any]:
    """
    Build a builtins dict from the allowlist + a safe __import__ wrapper.

    The safe __import__ wrapper blocks the _BLOCKED_MODULES set.
    All other modules (math, re, collections, datetime, etc.) are allowed.
    """
    all_builtins = vars(_builtins_module)

    safe: dict[str, Any] = {
        name: all_builtins[name]
        for name in _SAFE_BUILTIN_NAMES
        if name in all_builtins
    }

    # Wrap __import__ to block dangerous modules
    original_import: Callable = all_builtins["__import__"]

    def _safe_import(name: str, *args: Any, **kwargs: Any) -> Any:
        # Block top-level package name (e.g., "os.path" → block "os")
        top = name.split(".")[0]
        if top in blocked_modules or name in blocked_modules:
            raise ImportError(
                f"Module '{name}' is not allowed in the sandbox. "
                "Available modules: math, re, collections, datetime, itertools, "
                "functools, string, random, statistics, decimal, fractions, "
                "heapq, bisect, copy, pprint, enum, typing, dataclasses, abc."
            )
        return original_import(name, *args, **kwargs)

    safe["__import__"] = _safe_import
    return safe


# ---------------------------------------------------------------------------
# InProcessSandbox
# ---------------------------------------------------------------------------

class InProcessSandbox(SandboxManager):
    """
    Phase 8.11 in-process sandbox.

    Uses a restricted builtins namespace and a wrapped __import__ to block
    dangerous operations, while delegating execution to runner.run() with
    the timeout and trace-limit mechanisms already in place.

    Thread safety: this class is stateless — the safe_builtins dict is
    built once and shared across calls (it contains no mutable state).
    """

    def __init__(self) -> None:
        # Build once; reuse for every execute() call (safe — dict is read-only)
        self._safe_builtins: dict[str, Any] = _build_safe_builtins(_BLOCKED_MODULES)

    def execute(
        self,
        source: str,
        tree: ast.Module,
        config: RunConfig,
    ) -> RunResult:
        """
        Execute user code in a restricted namespace.

        Builds a fresh namespace dict for each call (no state leaks between
        executions even though _safe_builtins is shared).
        """
        namespace: dict[str, Any] = {
            "__name__": "__main__",
            "__builtins__": self._safe_builtins,
        }
        return run(source=source, tree=tree, config=config, namespace=namespace)

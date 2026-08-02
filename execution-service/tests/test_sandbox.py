"""
Phase 8.10 / 8.11 — Tests for execution timeout and sandbox isolation.

Structure:
  TestExecutionTimeout   - timeout triggers, step kind, status (8.10)
  TestSandboxBuiltins    - blocked vs allowed builtins (8.11)
  TestSandboxModules     - module allowlist / blocklist (8.11)
  TestSandboxManager     - factory method and ABC compliance (8.11)
  TestSandboxAPI         - end-to-end API tests for timeout + blocked builtins (8.10/8.11)
"""

import sys
import pytest
from fastapi.testclient import TestClient

from app.exceptions import ExecutionTimeout, SandboxViolation
from app.sandbox.manager import SandboxManager
from app.sandbox.in_process import InProcessSandbox, _BLOCKED_MODULES, _SAFE_BUILTIN_NAMES
from app.executor.runner import run, RunConfig
from app.parser import parse
from app.main import app

client = TestClient(app)


# ===========================================================================
# Helpers
# ===========================================================================

def _run(code: str, timeout: int = 5, trace_limit: int = 10_000):
    result = parse(code)
    assert result.success, f"Unexpected parse error: {result.error}"
    return run(
        source=code,
        tree=result.tree,
        config=RunConfig(trace_limit=trace_limit, timeout_seconds=timeout),
    )


def _sandbox_run(code: str, timeout: int = 5):
    """Run code through the full InProcessSandbox (same path as production)."""
    result = parse(code)
    assert result.success
    sandbox = InProcessSandbox()
    return sandbox.execute(
        source=code,
        tree=result.tree,
        config=RunConfig(timeout_seconds=timeout),
    )


# ===========================================================================
# Phase 8.10 — Execution timeout
# ===========================================================================

class TestExecutionTimeout:

    def test_timeout_status_on_infinite_loop(self):
        """An infinite loop must time out within timeout_seconds."""
        # Use very short timeout (1s) and a tight loop
        result = _run("while True:\n    x = 1", timeout=1)
        assert result.status == "timeout"

    def test_timeout_step_kind(self):
        result = _run("while True:\n    x = 1", timeout=1)
        assert result.steps[-1].kind == "timeout"

    def test_timeout_truncated_flag(self):
        result = _run("while True:\n    x = 1", timeout=1)
        assert result.truncated is True

    def test_timeout_step_has_description(self):
        result = _run("while True:\n    x = 1", timeout=1)
        assert "timed out" in result.steps[-1].description.lower()

    def test_steps_before_timeout_preserved(self):
        """Steps collected before timeout must be present."""
        code = "x = 1\ny = 2\nwhile True:\n    pass"
        result = _run(code, timeout=1)
        line_steps = [s for s in result.steps if s.kind == "line"]
        assert len(line_steps) >= 2

    def test_stdout_restored_after_timeout(self):
        """sys.stdout must be restored even on timeout."""
        original = sys.stdout
        _run("while True:\n    print('x')", timeout=1)
        assert sys.stdout is original

    def test_settrace_unset_after_timeout(self):
        """sys.gettrace() must be None after timeout."""
        _run("while True:\n    x = 1", timeout=1)
        assert sys.gettrace() is None

    def test_no_timeout_on_fast_code(self):
        """Normal code that finishes quickly must NOT trigger timeout."""
        result = _run("x = 1\ny = 2\nz = x + y", timeout=5)
        assert result.status == "completed"

    def test_execution_timeout_is_base_exception(self):
        """ExecutionTimeout must extend BaseException (not Exception)."""
        assert issubclass(ExecutionTimeout, BaseException)
        assert not issubclass(ExecutionTimeout, Exception)

    def test_timeout_not_caught_by_except_exception(self):
        """User code with `except Exception:` should NOT suppress timeout."""
        code = (
            "try:\n"
            "    while True:\n"
            "        pass\n"
            "except Exception:\n"
            "    pass\n"
        )
        result = _run(code, timeout=1)
        assert result.status == "timeout"

    def test_timeout_seconds_field_in_description(self):
        result = _run("while True:\n    x = 1", timeout=1)
        timeout_step = result.steps[-1]
        assert "1s" in timeout_step.description or "1" in timeout_step.description


# ===========================================================================
# Phase 8.11 — Sandbox: blocked builtins
# ===========================================================================

class TestSandboxBuiltins:

    def test_open_is_blocked(self):
        """open() must not be available in the sandbox."""
        result = _sandbox_run("f = open('test.txt')")
        assert result.status == "runtime_error"
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.error_type in ("NameError", "ImportError", "PermissionError")

    def test_exec_is_blocked(self):
        result = _sandbox_run("exec('x = 1')")
        assert result.status == "runtime_error"
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.error_type == "NameError"

    def test_eval_is_blocked(self):
        result = _sandbox_run("y = eval('1 + 1')")
        assert result.status == "runtime_error"
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.error_type == "NameError"

    def test_compile_is_blocked(self):
        result = _sandbox_run("c = compile('x=1', '<str>', 'exec')")
        assert result.status == "runtime_error"
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.error_type == "NameError"

    def test_breakpoint_is_blocked(self):
        result = _sandbox_run("breakpoint()")
        assert result.status == "runtime_error"
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.error_type == "NameError"

    def test_input_is_blocked(self):
        result = _sandbox_run("x = input('enter: ')")
        assert result.status == "runtime_error"
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.error_type == "NameError"

    def test_print_is_allowed(self):
        result = _sandbox_run("print('hello')")
        assert result.status == "completed"
        all_output = "".join(s.output for s in result.steps)
        assert "hello" in all_output

    def test_len_is_allowed(self):
        result = _sandbox_run("x = len([1, 2, 3])")
        assert result.status == "completed"

    def test_range_is_allowed(self):
        result = _sandbox_run("for i in range(5):\n    pass")
        assert result.status == "completed"

    def test_isinstance_is_allowed(self):
        result = _sandbox_run("x = isinstance(1, int)")
        assert result.status == "completed"

    def test_sorted_is_allowed(self):
        result = _sandbox_run("x = sorted([3, 1, 2])")
        assert result.status == "completed"

    def test_safe_builtin_names_contains_print(self):
        assert "print" in _SAFE_BUILTIN_NAMES

    def test_safe_builtin_names_does_not_contain_open(self):
        assert "open" not in _SAFE_BUILTIN_NAMES

    def test_safe_builtin_names_does_not_contain_eval(self):
        assert "eval" not in _SAFE_BUILTIN_NAMES


# ===========================================================================
# Phase 8.11 — Sandbox: module blocklist
# ===========================================================================

class TestSandboxModules:

    def test_import_os_is_blocked(self):
        result = _sandbox_run("import os")
        assert result.status == "runtime_error"
        error_step = next(s for s in result.steps if s.kind == "error")
        assert error_step.error_type == "ImportError"

    def test_import_sys_is_blocked(self):
        result = _sandbox_run("import sys")
        assert result.status == "runtime_error"

    def test_import_socket_is_blocked(self):
        result = _sandbox_run("import socket")
        assert result.status == "runtime_error"

    def test_import_subprocess_is_blocked(self):
        result = _sandbox_run("import subprocess")
        assert result.status == "runtime_error"

    def test_import_math_is_allowed(self):
        result = _sandbox_run("import math\nx = math.sqrt(4)")
        assert result.status == "completed"

    def test_import_random_is_allowed(self):
        result = _sandbox_run("import random\nrandom.seed(42)\nx = random.randint(1,10)")
        assert result.status == "completed"

    def test_import_collections_is_allowed(self):
        result = _sandbox_run("from collections import Counter\nc = Counter([1,2,2,3])")
        assert result.status == "completed"

    def test_import_re_is_allowed(self):
        result = _sandbox_run("import re\nm = re.match(r'\\d+', '123')")
        assert result.status == "completed"

    def test_blocked_modules_contains_os(self):
        assert "os" in _BLOCKED_MODULES

    def test_blocked_modules_contains_socket(self):
        assert "socket" in _BLOCKED_MODULES

    def test_blocked_modules_contains_subprocess(self):
        assert "subprocess" in _BLOCKED_MODULES

    def test_error_message_mentions_available_modules(self):
        result = _sandbox_run("import os")
        error_step = next(s for s in result.steps if s.kind == "error")
        assert "math" in error_step.error_message or "Available" in (error_step.error_message or "")


# ===========================================================================
# Phase 8.11 — SandboxManager ABC and factory
# ===========================================================================

class TestSandboxManager:

    def test_create_default_returns_sandbox_manager(self):
        sb = SandboxManager.create_default()
        assert isinstance(sb, SandboxManager)

    def test_create_default_returns_in_process_sandbox(self):
        sb = SandboxManager.create_default()
        assert isinstance(sb, InProcessSandbox)

    def test_in_process_sandbox_is_sandbox_manager(self):
        assert issubclass(InProcessSandbox, SandboxManager)

    def test_sandbox_stateless_between_calls(self):
        """Variable defined in one call must not leak into the next."""
        sb = InProcessSandbox()
        result1 = parse("secret = 42")
        result2 = parse("x = secret")
        assert result1.success and result2.success
        sb.execute(result1.tree and "secret = 42", result1.tree, RunConfig())
        # Second call in a fresh namespace — 'secret' must not be defined
        run2 = sb.execute("x = secret", result2.tree, RunConfig())
        assert run2.status == "runtime_error"
        error = next(s for s in run2.steps if s.kind == "error")
        assert error.error_type == "NameError"

    def test_sandbox_execute_returns_run_result(self):
        from app.executor.runner import RunResult
        sb = InProcessSandbox()
        result = parse("x = 1")
        assert result.success
        run_result = sb.execute("x = 1", result.tree, RunConfig())
        assert isinstance(run_result, RunResult)


# ===========================================================================
# End-to-end API tests (8.10 + 8.11)
# ===========================================================================

class TestSandboxAPI:

    def test_timeout_via_api(self):
        response = client.post(
            "/execute",
            json={"code": "while True:\n    x = 1", "timeout_seconds": 1},
        )
        data = response.json()
        assert data["status"] == "timeout"
        assert data["steps"][-1]["kind"] == "timeout"

    def test_blocked_builtin_returns_runtime_error_via_api(self):
        response = client.post("/execute", json={"code": "f = open('test.txt')"})
        data = response.json()
        assert data["status"] == "runtime_error"

    def test_blocked_module_returns_runtime_error_via_api(self):
        response = client.post("/execute", json={"code": "import os"})
        data = response.json()
        assert data["status"] == "runtime_error"

    def test_allowed_module_works_via_api(self):
        response = client.post("/execute", json={"code": "import math\nx = math.pi"})
        data = response.json()
        assert data["status"] == "completed"

    def test_safe_code_still_works_via_api(self):
        code = "def factorial(n):\n    return 1 if n <= 1 else n * factorial(n-1)\nresult = factorial(5)"
        response = client.post("/execute", json={"code": code})
        data = response.json()
        assert data["status"] == "completed"
        assert data["total_steps"] > 0

    def test_print_still_works_after_sandbox(self):
        response = client.post("/execute", json={"code": "print('sandbox ok')"})
        data = response.json()
        assert data["status"] == "completed"
        all_output = "".join(s.get("output", "") for s in data["steps"])
        assert "sandbox ok" in all_output

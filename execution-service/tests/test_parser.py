"""
Phase 8.2 — Tests for the AST parser module.

Covers: valid code, syntax errors, edge cases, and integration with the
FastAPI /execute endpoint via httpx TestClient.
"""

import ast
import pytest
from fastapi.testclient import TestClient

from app.parser.ast_parser import parse, ParseResult, SyntaxErrorDetail
from app.main import app

client = TestClient(app)


# ===========================================================================
# Unit tests — app.parser.ast_parser.parse()
# ===========================================================================

class TestParseSuccess:
    """Valid code should return success=True with a well-formed AST."""

    def test_single_line_assignment(self):
        result = parse("x = 1")
        assert result.success is True
        assert result.tree is not None
        assert isinstance(result.tree, ast.Module)
        assert result.error is None

    def test_multi_line_valid_code(self):
        code = "x = 1\ny = 2\nz = x + y"
        result = parse(code)
        assert result.success is True
        assert result.tree is not None
        # Should have 3 statements in the module body
        assert len(result.tree.body) == 3

    def test_valid_function_definition(self):
        code = (
            "def add(a, b):\n"
            "    return a + b\n"
            "\n"
            "result = add(2, 3)\n"
        )
        result = parse(code)
        assert result.success is True
        assert result.tree is not None

    def test_unicode_identifiers(self):
        """Python 3 supports non-ASCII identifiers — parser must handle them."""
        code = "café = 42\nnaïve = café + 1"
        result = parse(code)
        assert result.success is True
        assert result.tree is not None

    def test_deeply_nested_valid_expression(self):
        """Deeply nested but syntactically valid expression."""
        code = "result = ((((1 + 2) * 3) - 4) / 5)"
        result = parse(code)
        assert result.success is True

    def test_class_definition(self):
        code = (
            "class Node:\n"
            "    def __init__(self, val):\n"
            "        self.val = val\n"
            "        self.next = None\n"
        )
        result = parse(code)
        assert result.success is True

    def test_for_loop(self):
        code = "for i in range(10):\n    print(i)\n"
        result = parse(code)
        assert result.success is True

    def test_try_except(self):
        code = "try:\n    x = 1/0\nexcept ZeroDivisionError:\n    x = 0\n"
        result = parse(code)
        assert result.success is True


class TestParseFailure:
    """Invalid code should return success=False with populated error details."""

    def test_mismatched_parenthesis(self):
        result = parse("x = (1 + 2")
        assert result.success is False
        assert result.error is not None
        assert result.error.type in ("SyntaxError",)
        assert result.error.message != ""

    def test_invalid_token(self):
        result = parse("x = $invalid")
        assert result.success is False
        assert result.error is not None

    def test_error_has_line_number(self):
        """Line number must be populated for single-line syntax errors."""
        result = parse("x = (")
        assert result.success is False
        assert result.error is not None
        assert result.error.line >= 1

    def test_error_has_column(self):
        """Column offset must be populated."""
        result = parse("x = (")
        assert result.success is False
        assert result.error is not None
        assert result.error.col >= 0

    def test_multiline_syntax_error_line(self):
        """Error on line 3 should report line=3."""
        code = "x = 1\ny = 2\nz = ("
        result = parse(code)
        assert result.success is False
        assert result.error is not None
        assert result.error.line == 3

    def test_indentation_error(self):
        """IndentationError is a subclass of SyntaxError — must be caught."""
        code = "def f():\nreturn 1"
        result = parse(code)
        assert result.success is False
        assert result.error is not None
        # IndentationError subclasses SyntaxError
        assert "Error" in result.error.type


class TestParseEdgeCases:
    """Edge cases that could cause unexpected behaviour."""

    def test_empty_string(self):
        """Empty string is valid Python (empty module)."""
        result = parse("")
        assert result.success is True
        assert result.tree is not None
        assert len(result.tree.body) == 0

    def test_whitespace_only(self):
        """Whitespace-only is valid Python."""
        result = parse("   \n\t\n  ")
        assert result.success is True

    def test_comment_only(self):
        """A file with only comments is valid Python."""
        result = parse("# This is just a comment\n# Another comment\n")
        assert result.success is True

    def test_returns_parse_result_type(self):
        """Return type must always be ParseResult."""
        result = parse("x = 1")
        assert isinstance(result, ParseResult)

    def test_error_is_syntax_error_detail(self):
        """Error field must be SyntaxErrorDetail when parse fails."""
        result = parse("x = (")
        assert isinstance(result.error, SyntaxErrorDetail)

    def test_non_string_input(self):
        """Non-string input returns failure, not an unhandled exception."""
        result = parse(123)  # type: ignore
        assert result.success is False
        assert result.error is not None


# ===========================================================================
# Integration tests — POST /execute endpoint with AST parser wired in
# ===========================================================================

class TestExecuteEndpointWithParser:
    """Verify that /execute correctly surfaces syntax errors and accepts valid code."""

    def test_valid_code_returns_completed(self):
        response = client.post("/execute", json={"code": "x = 1"})
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"

    def test_syntax_error_returns_syntax_error_status(self):
        response = client.post("/execute", json={"code": "x = ("})
        assert response.status_code == 200  # HTTP 200 — error is in the trace, not HTTP status
        data = response.json()
        assert data["status"] == "syntax_error"

    def test_syntax_error_has_one_step(self):
        response = client.post("/execute", json={"code": "x = ("})
        data = response.json()
        assert data["total_steps"] == 1
        assert len(data["steps"]) == 1

    def test_syntax_error_step_kind_is_error(self):
        response = client.post("/execute", json={"code": "x = ("})
        data = response.json()
        step = data["steps"][0]
        assert step["kind"] == "error"
        assert step["error_type"] == "SyntaxError"

    def test_syntax_error_has_line_info(self):
        response = client.post("/execute", json={"code": "x = ("})
        data = response.json()
        step = data["steps"][0]
        assert step["line"] >= 1

    def test_syntax_error_description_contains_message(self):
        response = client.post("/execute", json={"code": "x = ("})
        data = response.json()
        step = data["steps"][0]
        assert step["description"] != ""

    def test_multiline_valid_code_accepted(self):
        code = "x = 1\ny = 2\nz = x + y"
        response = client.post("/execute", json={"code": code})
        assert response.status_code == 200
        assert response.json()["status"] == "completed"

    def test_empty_code_rejected_by_schema(self):
        """Empty string is blocked by the Pydantic min_length=1 validator."""
        response = client.post("/execute", json={"code": ""})
        assert response.status_code == 422

    def test_multiline_syntax_error_line_number(self):
        """Line number in the error step must point to the correct line."""
        code = "x = 1\ny = 2\nz = ("
        response = client.post("/execute", json={"code": code})
        data = response.json()
        assert data["status"] == "syntax_error"
        step = data["steps"][0]
        assert step["line"] == 3

    def test_unicode_code_accepted(self):
        response = client.post("/execute", json={"code": "café = 42"})
        assert response.status_code == 200
        assert response.json()["status"] == "completed"

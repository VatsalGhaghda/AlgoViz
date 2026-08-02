"""
Python AST Parser for the AlgoVisualizer execution service.

Wraps stdlib `ast.parse()` with safe error handling so that syntax errors
are returned as structured data rather than exceptions.

Usage:
    from app.parser.ast_parser import parse

    result = parse("x = 1 + 2")
    if result.success:
        # result.tree is an ast.Module you can compile/walk
    else:
        # result.error contains line, col, message
"""

from __future__ import annotations

import ast
from dataclasses import dataclass, field
from typing import Optional


# ---------------------------------------------------------------------------
# Result types
# ---------------------------------------------------------------------------

@dataclass
class SyntaxErrorDetail:
    """Structured representation of a Python SyntaxError."""
    type: str = "SyntaxError"
    message: str = ""
    line: int = 0
    col: int = 0
    text: Optional[str] = None  # The offending source line, if available


@dataclass
class ParseResult:
    """
    Outcome of a parse() call.

    On success:  success=True, tree is an ast.Module, error is None.
    On failure:  success=False, tree is None, error is a SyntaxErrorDetail.
    """
    success: bool
    tree: Optional[ast.Module] = field(default=None, repr=False)
    error: Optional[SyntaxErrorDetail] = None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def parse(source: str) -> ParseResult:
    """
    Parse Python source code into an AST.

    Handles:
    - Valid single-line and multi-line code            → success=True
    - Empty / whitespace-only strings                  → success=True (empty module)
    - SyntaxError (mismatched parens, invalid tokens)  → success=False with details
    - Any other unexpected error during parsing        → success=False with details

    Args:
        source: Python source code string. Null bytes must be stripped by the
                caller before passing here (controller handles this).

    Returns:
        ParseResult with .success, .tree, and .error populated.
    """
    if not isinstance(source, str):
        return ParseResult(
            success=False,
            error=SyntaxErrorDetail(
                type="TypeError",
                message="Source code must be a string.",
            ),
        )

    # Empty / whitespace-only → valid (empty module body)
    if source.strip() == "":
        try:
            tree = ast.parse("", mode="exec")
            return ParseResult(success=True, tree=tree)
        except Exception as exc:  # pragma: no cover — shouldn't happen
            return ParseResult(
                success=False,
                error=SyntaxErrorDetail(type=type(exc).__name__, message=str(exc)),
            )

    try:
        tree = ast.parse(source, mode="exec")
        return ParseResult(success=True, tree=tree)

    except SyntaxError as exc:
        return ParseResult(
            success=False,
            error=SyntaxErrorDetail(
                type=type(exc).__name__,   # SyntaxError, IndentationError, TabError, etc.
                message=exc.msg or str(exc),
                line=exc.lineno or 0,
                col=exc.offset or 0,
                text=(exc.text or "").rstrip("\n") if exc.text else None,
            ),
        )

    except Exception as exc:
        # Unexpected parser failure — surface it safely
        return ParseResult(
            success=False,
            error=SyntaxErrorDetail(
                type=type(exc).__name__,
                message=str(exc),
            ),
        )

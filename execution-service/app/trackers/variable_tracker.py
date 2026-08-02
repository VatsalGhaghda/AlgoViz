"""
Variable tracker — captures and diffs local/global variable state per execution step.

Attached to LineTracker so every "line" event carries a full variable snapshot.
Each variable entry records name, serialized value, Python type, whether it changed
since the last step in this frame, and its scope (local/global).

Phase 8.4: Capture locals/globals after each executed line.
"""

from __future__ import annotations

import math
import types
from typing import Any

from app.schemas import VariableEntry

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MAX_COLLECTION_SIZE = 20   # Max items rendered in list / dict / set
MAX_REPR_LENGTH = 200      # Max chars for fallback repr() strings
MAX_STR_LENGTH = 300       # Max chars for plain string values

# Variables to always exclude — Python runtime internals injected into namespaces
_EXCLUDED_KEYS: frozenset[str] = frozenset({
    "__name__", "__doc__", "__package__", "__loader__", "__spec__",
    "__builtins__", "__build_class__", "__cached__", "__file__",
    "__annotations__", "__dict__", "__module__", "__weakref__",
})

# Python type name -> canonical VariableType string (matches shared/types/execution.ts)
_TYPE_MAP: dict[str, str] = {
    "int": "int", "float": "float", "str": "str", "bool": "bool",
    "list": "list", "tuple": "tuple", "dict": "dict",
    "set": "set", "frozenset": "set", "NoneType": "NoneType",
}


def _is_imported_value(name: str, value: object, frame) -> bool:
    """
    Return True if `value` should be excluded from the variable snapshot
    because it is either:
      - an imported module / builtin
      - a user-defined function (def ...) or class (class ...)
      - a callable imported from another module

    We never want to show function definitions or class objects in Memory View —
    they are code, not data.

    Heuristics (any one is sufficient):
    1. The value is a module (types.ModuleType).
    2. The value is a builtin function / builtin method type.
    3. The value is a user-defined function (types.FunctionType) — this covers
       every `def` statement regardless of scope.
    4. The value is a user-defined method (types.MethodType).
    5. The value is a type/class (isinstance check for type) — covers `class` defs.
    6. The callable comes from a different module (imported function/class).
    """
    if isinstance(value, types.ModuleType):
        return True
    if isinstance(value, types.BuiltinFunctionType):
        return True
    if isinstance(value, types.BuiltinMethodType):
        return True
    # User-defined functions (def ...) and methods — never show as variables
    if isinstance(value, types.FunctionType):
        return True
    if isinstance(value, types.MethodType):
        return True
    # Class definitions (class ...) — not a data variable
    if isinstance(value, type):
        return True
    # Imported callables from external modules
    if callable(value) and hasattr(value, "__module__"):
        obj_module = getattr(value, "__module__", None)
        frame_module = frame.f_globals.get("__name__", None)
        if obj_module and frame_module and obj_module != frame_module:
            return True
    return False


# ---------------------------------------------------------------------------
# Serialization helpers (module-level so runner.py can import them)
# ---------------------------------------------------------------------------

def get_var_type(value: Any) -> str:
    """Return the canonical VariableType string for a Python value."""
    if value is None:
        return "NoneType"
    if isinstance(value, bool):   # bool is a subclass of int -- check first!
        return "bool"
    return _TYPE_MAP.get(type(value).__name__, "unknown")


def serialize_value(value: Any, depth: int = 0) -> Any:
    """
    Safely convert an arbitrary Python value to a JSON-serializable form.

    Rules:
    - Primitives (None, bool, int, float, str) are returned directly.
    - float NaN/Inf are converted to strings.
    - str values longer than MAX_STR_LENGTH are truncated.
    - list/tuple items are serialized recursively up to depth 2.
    - dict keys are stringified; values serialized recursively.
    - set/frozenset items are sorted (by repr) and serialized.
    - Anything else falls back to a bounded repr() string.
    - At depth >= 2, everything falls back to repr() to prevent deep recursion.
    """
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return str(value)
        return value
    if isinstance(value, str):
        if len(value) > MAX_STR_LENGTH:
            return value[:MAX_STR_LENGTH] + "..."
        return value
    if depth >= 2:
        return _safe_repr(value)
    if isinstance(value, (list, tuple)):
        chunk = list(value[:MAX_COLLECTION_SIZE])
        result: list = [serialize_value(item, depth + 1) for item in chunk]
        if len(value) > MAX_COLLECTION_SIZE:
            result.append(f"... {len(value) - MAX_COLLECTION_SIZE} more items")
        return result
    if isinstance(value, dict):
        out: dict = {}
        for i, (k, v) in enumerate(value.items()):
            if i >= MAX_COLLECTION_SIZE:
                out[f"... {len(value) - MAX_COLLECTION_SIZE} more"] = "..."
                break
            out[str(k)[:50]] = serialize_value(v, depth + 1)
        return out
    if isinstance(value, (set, frozenset)):
        items = sorted(value, key=_safe_repr)[:MAX_COLLECTION_SIZE]
        result = [serialize_value(item, depth + 1) for item in items]
        if len(value) > MAX_COLLECTION_SIZE:
            result.append(f"... {len(value) - MAX_COLLECTION_SIZE} more items")
        return result
    return _safe_repr(value)


def _safe_repr(value: Any) -> str:
    """Return a bounded repr() string, never raising."""
    try:
        r = repr(value)
        return r[:MAX_REPR_LENGTH] + "..." if len(r) > MAX_REPR_LENGTH else r
    except Exception:
        return "<unrepresentable>"


# ---------------------------------------------------------------------------
# VariableTracker
# ---------------------------------------------------------------------------

class VariableTracker:
    """
    Diffs frame.f_locals after each executed line and produces VariableEntry snapshots.

    Tracks previous state per frame (keyed by frame id) so the 'changed' flag
    correctly reflects only variables that changed since the last step in that
    frame -- not global changes across frames.
    """

    def __init__(self) -> None:
        # frame_id -> {var_name -> repr_string} for change detection
        self._prev: dict[int, dict[str, str]] = {}

    def capture(self, frame) -> dict[str, VariableEntry]:
        """
        Capture a variable snapshot from a frame's locals.

        Args:
            frame: A Python frame object (from sys.settrace callback).

        Returns:
            Dict mapping variable names to VariableEntry objects.
            Variables in _EXCLUDED_KEYS are omitted.
        """
        frame_id = id(frame)
        scope = "global" if frame.f_locals is frame.f_globals else "local"

        raw: dict[str, Any] = {
            k: v
            for k, v in frame.f_locals.items()
            if k not in _EXCLUDED_KEYS and not _is_imported_value(k, v, frame)
        }

        prev = self._prev.get(frame_id, {})
        result: dict[str, VariableEntry] = {}

        for name, value in raw.items():
            current_repr = _safe_repr(value)
            changed = (name not in prev) or (prev[name] != current_repr)
            result[name] = VariableEntry(
                name=name,
                value=serialize_value(value),
                type=get_var_type(value),
                changed=changed,
                scope=scope,
            )

        # Update previous snapshot for this frame
        self._prev[frame_id] = {k: _safe_repr(v) for k, v in raw.items()}
        return result

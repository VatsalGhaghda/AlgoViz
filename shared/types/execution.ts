/**
 * Canonical TypeScript types for the Python execution engine.
 *
 * These interfaces are the TypeScript mirror of the Pydantic schemas defined in:
 *   execution-service/app/schemas.py
 *
 * Used by:
 *   - backend/src/controllers/execution.controller.ts  (request validation + response forwarding)
 *   - frontend/src/types/python-execution.ts           (UI types, extended for component needs)
 *
 * IMPORTANT: Keep in sync with schemas.py. When the Python schema changes, update this file.
 */

// ---------------------------------------------------------------------------
// Request
// ---------------------------------------------------------------------------

export interface ExecutionRequest {
  /** Python source code. Max 50 KB. */
  code: string;
  /**
   * Maximum number of ExecutionStep objects to collect.
   * Default: 10_000. Min: 100. Hard max: 50_000.
   */
  trace_limit?: number;
  /** Execution timeout in seconds. Default: 5. Min: 1. Max: 10. */
  timeout_seconds?: number;
}

// ---------------------------------------------------------------------------
// Shared sub-objects
// ---------------------------------------------------------------------------

export type VariableType =
  | "int"
  | "float"
  | "str"
  | "bool"
  | "list"
  | "tuple"
  | "dict"
  | "set"
  | "NoneType"
  | "unknown";

export interface VariableEntry {
  name: string;
  value: unknown;
  type: VariableType;
  /** True if this variable was created or updated at this step. */
  changed: boolean;
  scope: "local" | "global";
}

export interface StackFrame {
  func_name: string;
  line_no: number;
  filename: string;
}

// ---------------------------------------------------------------------------
// Step kinds & statuses
// ---------------------------------------------------------------------------

export type StepKind = "line" | "call" | "return" | "error" | "limit" | "timeout";

export type ExecutionStatus =
  | "completed"
  | "syntax_error"
  | "runtime_error"
  | "trace_limit_reached"
  | "timeout"
  | "sandbox_error";

// ---------------------------------------------------------------------------
// Execution step (canonical trace unit)
// ---------------------------------------------------------------------------

export interface ExecutionStep {
  /** 0-based monotonically increasing index. */
  step_index: number;
  /** 1-indexed source line number. */
  line: number;
  kind: StepKind;
  /** Human-readable explanation. */
  description: string;
  /** Variable snapshot keyed by variable name. */
  vars: Record<string, VariableEntry>;
  /** Call stack (bottom-to-top). */
  call_stack: StackFrame[];
  /** Console output produced at this step. */
  output: string;
  /** {line_no: highlight_state} for editor decoration. */
  highlights: Record<number, string>;
  // Optional fields — present only for specific kinds
  func_name?: string;
  args?: Record<string, unknown>;
  return_value?: unknown;
  error_type?: string;
  error_message?: string;
  traceback_summary?: string;
}

// ---------------------------------------------------------------------------
// Response
// ---------------------------------------------------------------------------

export interface ExecutionResponse {
  steps: ExecutionStep[];
  status: ExecutionStatus;
  /** Total number of steps in this response. */
  total_steps: number;
  /**
   * True when trace_limit was hit and the trace was cut short.
   * Frontend should display a truncation warning banner.
   */
  truncated: boolean;
}

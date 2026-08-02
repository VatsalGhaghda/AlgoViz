/**
 * TypeScript mirror of the Python execution service's Pydantic schemas.
 * Kept in sync with: execution-service/app/schemas.py
 */

// ── Sub-objects ──────────────────────────────────────────────────────────────

export interface VariableEntry {
  name: string;
  value: string | number | boolean | null | unknown[];
  type: string; // "int" | "float" | "str" | "bool" | "list" | "dict" | "set" | "tuple" | "NoneType" | "unknown"
  changed: boolean;
  scope: "local" | "global";
}

export interface StackFrame {
  func_name: string;
  line_no: number;
  filename: string;
}

// ── Step kinds ───────────────────────────────────────────────────────────────

export type StepKind = "line" | "call" | "return" | "error" | "limit" | "timeout";

export type ExecutionStatus =
  | "completed"
  | "syntax_error"
  | "runtime_error"
  | "trace_limit_reached"
  | "timeout"
  | "sandbox_error";

// ── Execution step ───────────────────────────────────────────────────────────

export interface ExecutionStep {
  step_index: number;
  line: number;
  kind: StepKind;
  description: string;
  vars: Record<string, VariableEntry>;
  call_stack: StackFrame[];
  output: string;
  highlights: Record<number, string>;
  // Optional — present only on specific kinds
  func_name?: string;
  args?: Record<string, unknown>;
  return_value?: unknown;
  error_type?: string;
  error_message?: string;
  traceback_summary?: string;
}

// ── Response envelope ────────────────────────────────────────────────────────

export interface ExecutionResponse {
  steps: ExecutionStep[];
  status: ExecutionStatus;
  total_steps: number;
  truncated: boolean;
}

// ── Typed API error ──────────────────────────────────────────────────────────

export class ExecutionApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly detail?: unknown,
  ) {
    super(message);
    this.name = "ExecutionApiError";
  }
}

// ── Mapping util: ExecutionStep.vars → VariablesPanel-compatible format ───────

/**
 * Maps Python ExecutionStep vars to the format expected by VariablesPanel
 * ({ value, type, changed }).  The panel component itself is not modified.
 */
export function mapVarsToPanel(
  vars: Record<string, VariableEntry>,
): Record<string, { value: string | number | boolean | null | unknown[]; type: string; changed: boolean }> {
  const result: Record<string, { value: string | number | boolean | null | unknown[]; type: string; changed: boolean }> = {};
  for (const [name, entry] of Object.entries(vars)) {
    result[name] = {
      value: entry.value as string | number | boolean | null | unknown[],
      type: entry.type,
      changed: entry.changed,
    };
  }
  return result;
}

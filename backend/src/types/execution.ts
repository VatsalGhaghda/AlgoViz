/**
 * Backend-local copy of the canonical execution types.
 * Source of truth: shared/types/execution.ts
 * Keep in sync when schemas.py changes.
 */

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
  changed: boolean;
  scope: "local" | "global";
}

export interface StackFrame {
  func_name: string;
  line_no: number;
  filename: string;
}

export type StepKind = "line" | "call" | "return" | "error" | "limit" | "timeout";

export type ExecutionStatus =
  | "completed"
  | "syntax_error"
  | "runtime_error"
  | "trace_limit_reached"
  | "timeout"
  | "sandbox_error";

export interface ExecutionStep {
  step_index: number;
  line: number;
  kind: StepKind;
  description: string;
  vars: Record<string, VariableEntry>;
  call_stack: StackFrame[];
  output: string;
  highlights: Record<number, string>;
  func_name?: string;
  args?: Record<string, unknown>;
  return_value?: unknown;
  error_type?: string;
  error_message?: string;
  traceback_summary?: string;
}

export interface ExecutionRequest {
  code: string;
  trace_limit?: number;
  timeout_seconds?: number;
}

export interface ExecutionResponse {
  steps: ExecutionStep[];
  status: ExecutionStatus;
  total_steps: number;
  truncated: boolean;
}

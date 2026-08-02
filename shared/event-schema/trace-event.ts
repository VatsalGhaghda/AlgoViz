/**
 * Canonical trace event schema for the AlgoVisualizer execution engine.
 *
 * This file defines the final, serialized shape of all events that flow
 * from the Python execution service → Express backend → Frontend.
 *
 * The Python source of truth is execution-service/app/schemas.py.
 * This file re-exports from shared/types/execution.ts for convenience.
 *
 * Updated as Phase 8 progresses (8.1 → 8.10 locks the final shape).
 */

export type {
  ExecutionRequest,
  ExecutionResponse,
  ExecutionStep,
  ExecutionStatus,
  StepKind,
  VariableEntry,
  VariableType,
  StackFrame,
} from "../types/execution";

/**
 * useExecution — Phase 9.1/9.3
 *
 * State machine for submitting code and holding the resulting trace.
 * Designed to be composed with usePlayback (Phase 9.4).
 */

import { useCallback, useRef, useState } from "react";
import { executeCode } from "@/lib/api/execution";
import type { ExecutionResponse, ExecutionStep, ExecutionStatus } from "@/types/python-execution";
import { ExecutionApiError } from "@/types/python-execution";

export interface ExecutionState {
  /** The full ordered step list from the last successful run. */
  steps: ExecutionStep[];
  /** Canonical status of the last execution. */
  status: ExecutionStatus | null;
  /** True while a request is in-flight. */
  isLoading: boolean;
  /** Typed API / network error (null when idle or after successful run). */
  error: ExecutionApiError | Error | null;
  /** True if the backend is running but the service returned a structured error step. */
  hasError: boolean;
}

export interface UseExecutionReturn extends ExecutionState {
  /** Submit code. Resolves when the request completes (success or error). */
  execute: (code: string) => Promise<void>;
  /** Clear all state (steps, status, error). */
  reset: () => void;
}

const INITIAL_STATE: ExecutionState = {
  steps: [],
  status: null,
  isLoading: false,
  error: null,
  hasError: false,
};

export function useExecution(): UseExecutionReturn {
  const [state, setState] = useState<ExecutionState>(INITIAL_STATE);

  // Abort controller — cancels any in-flight request when a new one starts
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (code: string) => {
    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result: ExecutionResponse = await executeCode(code, {
        signal: controller.signal,
      });

      // Detect structured error steps
      const hasError =
        result.status === "runtime_error" ||
        result.status === "syntax_error" ||
        result.status === "sandbox_error";

      setState({
        steps: result.steps,
        status: result.status,
        isLoading: false,
        error: null,
        hasError,
      });
    } catch (err) {
      // Ignore abort errors — user triggered a new run
      if (err instanceof DOMException && err.name === "AbortError") return;

      const typedError =
        err instanceof ExecutionApiError || err instanceof Error
          ? err
          : new Error(String(err));

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: typedError,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(INITIAL_STATE);
  }, []);

  return { ...state, execute, reset };
}

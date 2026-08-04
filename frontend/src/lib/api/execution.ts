/**
 * Execution API client — Phase 9.1
 *
 * Always calls POST /api/execute on the Express backend.
 * NEVER calls the execution-service directly.
 */

import type { ExecutionResponse } from "@/types/python-execution";
import { ExecutionApiError } from "@/types/python-execution";

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const API_URL = `${API_BASE}/api/execute`;
const MAX_CODE_BYTES = 50_000;
const DEFAULT_TRACE_LIMIT = 10_000;

export interface ExecuteOptions {
  traceLimit?: number;
  timeoutSeconds?: number;
  signal?: AbortSignal;
}

/**
 * Submit Python code for execution and return the canonical trace.
 *
 * @throws {ExecutionApiError} on network failure, unexpected HTTP status, or malformed response
 */
export async function executeCode(
  code: string,
  options: ExecuteOptions = {},
): Promise<ExecutionResponse> {
  const { traceLimit = DEFAULT_TRACE_LIMIT, timeoutSeconds = 5, signal } = options;

  // Client-side guard — backend enforces the same limit
  if (new TextEncoder().encode(code).length > MAX_CODE_BYTES) {
    throw new ExecutionApiError(
      `Code exceeds maximum size of ${MAX_CODE_BYTES / 1000} KB`,
    );
  }

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        trace_limit: Math.min(traceLimit, 50_000),
        timeout_seconds: Math.min(Math.max(timeoutSeconds, 1), 10),
      }),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ExecutionApiError(
      "Could not reach the execution service. Is the backend running?",
      undefined,
      err,
    );
  }

  if (!response.ok) {
    let detail: unknown;
    try { detail = await response.json(); } catch { /* ignore */ }
    throw new ExecutionApiError(
      `Execution service returned HTTP ${response.status}`,
      response.status,
      detail,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ExecutionApiError("Execution service returned malformed JSON");
  }

  return validateResponse(data);
}

function validateResponse(data: unknown): ExecutionResponse {
  if (
    typeof data !== "object" ||
    data === null ||
    !("steps" in data) ||
    !("status" in data) ||
    !Array.isArray((data as Record<string, unknown>).steps)
  ) {
    throw new ExecutionApiError(
      "Execution service response has unexpected shape",
      undefined,
      data,
    );
  }
  return data as ExecutionResponse;
}

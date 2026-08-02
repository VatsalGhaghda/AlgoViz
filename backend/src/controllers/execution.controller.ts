import { Request, Response } from "express";
import axios, { AxiosError } from "axios";
import type { ExecutionRequest, ExecutionResponse } from "../types/execution";

// ---------------------------------------------------------------------------
// Config — read from environment so limits can be tuned without code changes
// ---------------------------------------------------------------------------

const EXECUTION_SERVICE_URL =
  process.env.EXECUTION_SERVICE_URL || "http://localhost:8000";

const MAX_CODE_LENGTH_BYTES = 51_200; // 50 KB
const DEFAULT_TRACE_LIMIT = 10_000;
const MAX_TRACE_LIMIT = 50_000;
const MIN_TRACE_LIMIT = 100;
const DEFAULT_TIMEOUT_SECONDS = 5;
const REQUEST_TIMEOUT_MS = 15_000; // 15 seconds — covers execution + network latency

// ---------------------------------------------------------------------------
// POST /api/execute
// ---------------------------------------------------------------------------

export async function executeCode(req: Request, res: Response): Promise<void> {
  // --- 1. Validate request body shape ---
  const { code, trace_limit, timeout_seconds } = req.body as Partial<ExecutionRequest>;

  if (typeof code !== "string" || code.trim().length === 0) {
    res.status(400).json({
      error: "Bad Request",
      message: "Field 'code' is required and must be a non-empty string.",
    });
    return;
  }

  // --- 2. Enforce code size limit ---
  const codeSizeBytes = Buffer.byteLength(code, "utf8");
  if (codeSizeBytes > MAX_CODE_LENGTH_BYTES) {
    res.status(413).json({
      error: "Payload Too Large",
      message: `Code exceeds the maximum allowed size of ${MAX_CODE_LENGTH_BYTES / 1024} KB.`,
    });
    return;
  }

  // --- 3. Sanitize: strip null bytes ---
  const sanitizedCode = code.replace(/\x00/g, "");

  // --- 4. Cap and validate trace_limit ---
  let resolvedTraceLimit = DEFAULT_TRACE_LIMIT;
  if (trace_limit !== undefined) {
    const parsed = Number(trace_limit);
    if (!Number.isInteger(parsed) || parsed < MIN_TRACE_LIMIT) {
      res.status(400).json({
        error: "Bad Request",
        message: `'trace_limit' must be an integer >= ${MIN_TRACE_LIMIT}.`,
      });
      return;
    }
    resolvedTraceLimit = Math.min(parsed, MAX_TRACE_LIMIT);
  }

  // --- 5. Validate timeout_seconds ---
  let resolvedTimeout = DEFAULT_TIMEOUT_SECONDS;
  if (timeout_seconds !== undefined) {
    const parsed = Number(timeout_seconds);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 10) {
      res.status(400).json({
        error: "Bad Request",
        message: "'timeout_seconds' must be an integer between 1 and 10.",
      });
      return;
    }
    resolvedTimeout = parsed;
  }

  // --- 6. Forward to execution service ---
  const payload: ExecutionRequest = {
    code: sanitizedCode,
    trace_limit: resolvedTraceLimit,
    timeout_seconds: resolvedTimeout,
  };

  try {
    const serviceResponse = await axios.post<ExecutionResponse>(
      `${EXECUTION_SERVICE_URL}/execute`,
      payload,
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true, // Handle all status codes ourselves
      }
    );

    // --- 7. Validate execution service responded with a sensible shape ---
    const data = serviceResponse.data;
    if (
      !data ||
      typeof data !== "object" ||
      !Array.isArray(data.steps) ||
      typeof data.status !== "string"
    ) {
      res.status(502).json({
        error: "Bad Gateway",
        message: "Execution service returned an unexpected response shape.",
      });
      return;
    }

    // --- 8. Forward the validated response to the frontend ---
    res.status(200).json(data);
  } catch (err) {
    const axiosErr = err as AxiosError;

    if (axiosErr.code === "ECONNREFUSED") {
      res.status(503).json({
        error: "Service Unavailable",
        message:
          "The Python execution service is not reachable. Please try again later.",
      });
      return;
    }

    if (axiosErr.code === "ECONNABORTED" || axiosErr.code === "ETIMEDOUT") {
      res.status(504).json({
        error: "Gateway Timeout",
        message: "The execution service did not respond in time.",
      });
      return;
    }

    // Unexpected error — log it but never expose internals to the client
    console.error("[execution.controller] Unexpected error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred. Please try again.",
    });
  }
}

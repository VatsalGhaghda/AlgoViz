import { Router } from "express";
import { executeCode } from "../controllers/execution.controller";

const router = Router();

/**
 * POST /api/execute
 *
 * Accepts Python source code and returns a canonical execution trace.
 * The frontend must call this endpoint — never the execution service directly.
 *
 * Request body: { code: string, trace_limit?: number, timeout_seconds?: number }
 * Response:     ExecutionResponse (see shared/types/execution.ts)
 */
router.post("/", executeCode);

export default router;

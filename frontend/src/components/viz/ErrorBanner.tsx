/**
 * ErrorBanner — Phase 9.10
 *
 * Dismissable inline error banner for syntax and runtime errors.
 * - Framer Motion slide-in from below
 * - Rose color tokens (rose-500/rose-950)
 * - Shows error type, message, line/col when available
 * - onDismiss callback clears editor decorations too
 */

import { motion } from "motion/react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExecutionStep } from "@/types/python-execution";

interface Props {
  /** The error step to display. Null → banner not rendered (handled by parent AnimatePresence). */
  errorStep: ExecutionStep;
  /** Called when the user dismisses the banner. */
  onDismiss: () => void;
  className?: string;
}

export function ErrorBanner({ errorStep, onDismiss, className }: Props) {
  const isRuntime = errorStep.kind === "error";
  const isSyntax  = errorStep.error_type?.toLowerCase().includes("syntax");
  const label     = isSyntax ? "Syntax Error" : isRuntime ? "Runtime Error" : "Error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "flex items-start gap-3 rounded-lg border border-rose-500/25 bg-rose-950/60 px-4 py-3",
        "backdrop-blur-sm",
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-400" aria-hidden />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-[12px] font-semibold text-rose-400">{label}</span>
          {errorStep.error_type && errorStep.error_type !== label && (
            <span className="rounded bg-rose-500/15 px-1.5 py-0.5 font-mono text-[10px] text-rose-300">
              {errorStep.error_type}
            </span>
          )}
          {errorStep.line > 0 && (
            <span className="text-[11px] text-rose-400/70">
              line {errorStep.line}
            </span>
          )}
        </div>
        {errorStep.error_message && (
          <p className="mt-0.5 text-[11px] leading-relaxed text-rose-300/80">
            {errorStep.error_message}
          </p>
        )}
        {errorStep.traceback_summary && (
          <pre className="mt-1.5 overflow-x-auto whitespace-pre-wrap rounded bg-rose-950 px-2 py-1.5 font-mono text-[10px] text-rose-400/70">
            {errorStep.traceback_summary}
          </pre>
        )}
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className={cn(
          "shrink-0 rounded p-0.5 text-rose-400/60 transition-colors",
          "hover:bg-rose-500/20 hover:text-rose-300",
        )}
      >
        <X className="size-3.5" />
      </button>
    </motion.div>
  );
}

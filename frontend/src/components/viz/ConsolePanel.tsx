/**
 * ConsolePanel — Phase 9.8
 *
 * Displays accumulated stdout from steps 0..currentStepIndex.
 * - Output is cumulative — each step's `output` field is concatenated
 * - Auto-scrolls to bottom when output grows
 * - Clears when currentStepIndex returns to 0 (Restart)
 * - Monospace dark terminal aesthetic (bg-zinc-950 fills full panel height)
 */

import { useEffect, useRef } from "react";
import type { ExecutionStep } from "@/types/python-execution";

interface Props {
  steps: ExecutionStep[];
  currentStepIndex: number;
}

export function ConsolePanel({ steps, currentStepIndex }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Accumulate output up to and including currentStepIndex
  const output = steps
    .slice(0, currentStepIndex + 1)
    .map((s) => s.output)
    .filter(Boolean)
    .join("");

  // Auto-scroll to bottom when output grows
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [output]);

  return (
    // bg-zinc-950 on the outer wrapper ensures the terminal background is
    // consistent across the full slot height — no lighter panel-bg showing
    // through around the content area.
    <div
      ref={scrollRef}
      className="h-full min-h-0 overflow-y-auto bg-zinc-950 font-mono"
      style={{ backgroundColor: "rgb(9 9 11)" }} // zinc-950 explicit for shadow DOM consistency
      aria-label="Console output"
      aria-live="polite"
    >
      {output ? (
        <pre className="whitespace-pre-wrap break-words p-4 text-[12px] leading-relaxed text-emerald-400">
          {output}
        </pre>
      ) : (
        <div className="flex h-full min-h-[80px] items-center justify-center">
          <p className="text-[12px] text-zinc-600">No output</p>
        </div>
      )}
    </div>
  );
}


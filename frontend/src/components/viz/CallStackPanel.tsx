/**
 * CallStackPanel — Phase 9.6 (animation rework)
 *
 * Animation pattern mirrors VariablesPanel exactly:
 * - AnimatePresence initial={false} wrapping the list
 * - motion.li: opacity/height enter (0→auto) and exit (auto→0)  — frames push/pop
 * - AnimatePresence mode="popLayout" on the line-number value — updates slide
 *   up on change (new value enters from above, old exits below), same as the
 *   value animation in VariablesPanel.
 * - Auto-scroll: scrollRef on the overflow container; active frame scrolls into view.
 * - Visual tokens: identical to VariablesPanel (dot indicator, bg-highlight, accent).
 */

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { StackFrame } from "@/types/python-execution";
import { cn } from "@/lib/utils";

interface Props {
  frames: StackFrame[];
  currentLine: number;
}

export function CallStackPanel({ frames, currentLine }: Props) {
  // frames prop is bottom-to-top: frames[0] = oldest (<module>), frames[last] = active.
  // Render as-is so the oldest frame sits at the visual top and the active
  // frame grows in at the bottom — new calls are added BELOW the current frame.
  const orderedFrames = [...frames];
  const isEmpty = orderedFrames.length === 0;

  // Auto-scroll to the LAST (active) frame at the bottom.
  // Fires on every step so the newest frame stays visible.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!scrollRef.current || isEmpty) return;
    const rows = scrollRef.current.querySelectorAll("[data-frame-row]");
    rows[rows.length - 1]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [orderedFrames.length, isEmpty, currentLine]);

  return (
    // Scroll container — ref lives here, same pattern as VariablesPanel
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
      {isEmpty ? (
        <div className="flex items-center justify-center py-6">
          <p className="text-[12px] text-muted-foreground">No active function calls</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          <AnimatePresence initial={false}>
            {orderedFrames.map((frame, idx) => {
              // Active frame is the last element (bottom of the visual list)
              const isTopFrame = idx === orderedFrames.length - 1;
              const isActive   = isTopFrame && frame.line_no === currentLine;
              const displayName =
                frame.func_name === "<module>" ? "(module)" : frame.func_name;

              return (
                <motion.li
                  key={`${frame.func_name}-${idx}`}
                  data-frame-row
                  // Enter: fade + expand height (identical to VariablesPanel)
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-center justify-between gap-3 px-4 py-2.5 transition-colors",
                    isActive && "bg-highlight",
                  )}
                >
                  {/* Left: indicator dot + function name */}
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        isTopFrame ? "bg-accent" : "bg-border-strong",
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        "truncate font-mono text-[13px]",
                        isTopFrame ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {displayName}
                    </span>
                  </div>

                  {/* Right: "active" badge + animated line number */}
                  <div className="flex shrink-0 items-center gap-2">
                    {isTopFrame && (
                      <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                        active
                      </span>
                    )}

                    {/* Line number — same slide-up animation as VariablesPanel values */}
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={frame.line_no}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.14 }}
                        className={cn(
                          "rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]",
                          isTopFrame
                            ? "text-accent font-semibold"
                            : "text-muted-foreground",
                        )}
                      >
                        line {frame.line_no}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

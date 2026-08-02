import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { VisualizationStep } from "@/types/visualization";
import { cn } from "@/lib/utils";

interface Props {
  step: VisualizationStep;
}

export function VariablesPanel({ step }: Props) {
  const entries = Object.entries(step.vars || {}).filter(([name]) => !name.startsWith("_"));
  // Ref goes on the SCROLL CONTAINER (the div with overflow-y-auto),
  // not on the inner <ul>, so scrollIntoView actually scrolls it.
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const changedIdx = entries.findIndex(([, v]) => v.changed);
    if (changedIdx === -1) return;
    const rows = scrollRef.current.querySelectorAll("[data-var-row]");
    rows[changedIdx]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [entries]);

  return (
    // scroll container — the ref lives here
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
      <ul className="divide-y divide-border">
        <AnimatePresence initial={false}>
          {entries.map(([name, variable]) => (
            <motion.li
              key={name}
              data-var-row
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-2.5 transition-colors",
                variable.changed && "bg-highlight",
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    variable.changed ? "bg-accent" : "bg-border-strong",
                  )}
                  aria-hidden="true"
                />
                <span className="truncate font-mono text-[13px] text-foreground">{name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {variable.type}
                </span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={String(variable.value)}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.14 }}
                    className={cn(
                      "min-w-8 text-right font-mono text-[13px] font-semibold",
                      variable.changed ? "text-accent" : "text-surface-foreground",
                    )}
                  >
                    {variable.value === null ? "None" : String(variable.value)}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

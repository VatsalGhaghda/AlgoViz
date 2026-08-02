import { AnimatePresence, motion } from "motion/react";
import { Lightbulb } from "lucide-react";
import type { VisualizationStep } from "@/types/visualization";
import { cn } from "@/lib/utils";

interface Props {
  steps: VisualizationStep[];
  index: number;
}

export function ExplanationPanel({ steps, index }: Props) {
  const current = steps[index];
  const trail = steps.slice(Math.max(0, index - 2), index + 1);

  return (
    <section className="panel flex min-h-0 flex-col overflow-hidden" aria-label="Explanation">
      <div className="panel-header">
        <Lightbulb className="size-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="eyebrow">What&apos;s happening?</span>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
        <AnimatePresence initial={false}>
          {trail.map((s, i) => {
            const isCurrent = i === trail.length - 1;
            return (
              <motion.div
                key={`${index}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: isCurrent ? 1 : 0.6, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "rounded-lg border px-3 py-2.5",
                  isCurrent ? "border-primary bg-highlight" : "border-border",
                )}
              >
                <p
                  className={cn(
                    "text-[12.5px] leading-relaxed",
                    isCurrent ? "text-foreground" : "text-secondary-foreground",
                  )}
                >
                  {s.description}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="border-t border-border px-4 py-3">
        <p className="eyebrow mb-1.5">What&apos;s next</p>
        <p className="text-[12.5px] leading-relaxed text-secondary-foreground">
          {current.nextHint}
        </p>
      </div>
    </section>
  );
}

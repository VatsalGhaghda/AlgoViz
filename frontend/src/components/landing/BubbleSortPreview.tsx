import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { springs } from "@/lib/animation";

/* ─── Bubble-sort step generator ─── */
type BarState = "unsorted" | "comparing" | "sorted";

interface ArrayItem {
  id: number;
  value: number;
}

interface PreviewStep {
  array: ArrayItem[];
  states: BarState[];
  label: string;
}

function generateSteps(input: number[]): PreviewStep[] {
  const arr = input.map((val, idx) => ({ id: idx, value: val }));
  const n = arr.length;
  const steps: PreviewStep[] = [];
  const states: BarState[] = arr.map(() => "unsorted");

  const snap = (label: string) =>
    steps.push({ array: [...arr], states: [...states], label });

  snap("Initial array");

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Comparing
      states[j] = "comparing";
      states[j + 1] = "comparing";
      snap(`compare a[${j}] < a[${j + 1}]`);

      if (arr[j].value > arr[j + 1].value) {
        // Swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        snap(`swap a[${j}] ↔ a[${j + 1}]`);
      }

      states[j] = "unsorted";
      states[j + 1] = "unsorted";
    }
    states[n - i - 1] = "sorted";
    snap(`index ${n - i - 1} sorted`);
  }

  // Final — mark all sorted
  for (let k = 0; k < n; k++) states[k] = "sorted";
  snap("array sorted ✓");

  return steps;
}

/* ─── Colors ─── */
const BAR_STYLES: Record<BarState, string> = {
  unsorted:
    "bg-gradient-to-t from-[oklch(0.55_0.15_250)] to-[oklch(0.65_0.17_255)] border-[oklch(0.55_0.15_250)]/40",
  comparing:
    "bg-gradient-to-t from-[oklch(0.65_0.18_65)] to-[oklch(0.78_0.16_70)] border-[oklch(0.65_0.18_65)]/40",
  sorted:
    "bg-gradient-to-t from-[oklch(0.55_0.16_155)] to-[oklch(0.72_0.17_160)] border-[oklch(0.55_0.16_155)]/40",
};

const INITIAL_ARRAY = [12, 25, 18, 30, 22, 35, 28, 42, 15, 38, 45, 48];

/* ─── Component ─── */
export function BubbleSortPreview() {
  const steps = useMemo(() => generateSteps(INITIAL_ARRAY), []);
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const step = steps[index];
  const maxVal = useMemo(() => Math.max(...INITIAL_ARRAY), []);

  // Auto-start after mount with delay
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Playback loop
  useEffect(() => {
    if (!started) return;
    timer.current = setTimeout(
      () => {
        setIndex((prev) => {
          const next = prev + 1;
          if (next >= steps.length) {
            // Restart after pause
            setTimeout(() => setIndex(0), 2000);
            return prev;
          }
          return next;
        });
      },
      index === steps.length - 1 ? 2000 : 700,
    );
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [started, index, steps.length]);

  return (
    <div className="panel overflow-hidden select-none">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-elevated/60">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.63_0.21_25)]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0.17_70)]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.64_0.16_158)]" />
        </div>
        <div className="text-[11px] font-mono text-muted-foreground tracking-wide">
          bubble_sort.py
        </div>
      </div>

      {/* Bars */}
      <div className="flex items-end justify-center gap-[5px] px-5 pt-8 pb-4 h-[240px]">
        {step.array.map((item, i) => {
          const pct = (item.value / maxVal) * 100;
          const state = step.states[i];
          
          return (
            <motion.div
              key={`bar-item-${item.id}`}
              layout
              animate={{
                height: `${pct}%`,
                y: state === "comparing" ? -6 : 0,
              }}
              transition={springs.bouncy}
              className={`flex-1 flex items-end justify-center pb-2 rounded-t-md border ${BAR_STYLES[state]}`}
            >
              <span className="text-[10px] font-mono text-white/80">{item.value}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Footer: step info */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
        <div className="text-[11px] font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
          step {String(index + 1).padStart(2, '0')} / {steps.length}
        </div>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={step.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`text-[11px] font-mono ${
              step.label.startsWith("compare") ? "text-warning" : "text-primary"
            }`}
          >
            {step.label}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

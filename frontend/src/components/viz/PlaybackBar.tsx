import { useEffect, useMemo, useRef } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward, Shuffle } from "lucide-react";
import type { AlgorithmMeta, HighlightState, VisualizationStep } from "@/types/visualization";
import { cn } from "@/lib/utils";

/* ─── Timeline helpers ─── */

const dominant = (step: VisualizationStep): HighlightState | "error" => {
  if (step.kind === "error") return "error";
  const values = Object.values(step.highlights);
  if (values.includes("error")) return "error";
  if (values.includes("swap")) return "swap";
  if (values.includes("compare")) return "compare";
  if (values.includes("active")) return "active";
  if (values.includes("found")) return "found";
  if (values.length > 0 && values.every((v) => v === "sorted")) return "sorted";
  return "idle";
};

const segColor: Record<string, string> = {
  idle: "bg-viz-idle",
  compare: "bg-amber-500",
  swap: "bg-cyan-500",
  sorted: "bg-emerald-500",
  pivot: "bg-purple-500",
  key: "bg-cyan-500",
  active: "bg-cyan-500",
  found: "bg-emerald-500",
  visited: "bg-amber-500",
  current: "bg-amber-500",
  error: "bg-rose-500",
};

/* ─── Icon button ─── */

function IconAction({
  label,
  onClick,
  disabled,
  children,
  primary,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid place-items-center rounded-lg transition-colors disabled:opacity-40",
        primary
          ? "size-10 bg-primary text-primary-foreground shadow-[0_10px_28px_-12px_var(--color-primary)] hover:opacity-90"
          : "size-9 border border-border bg-elevated text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/* ─── Stat pill (Time / Space / Category) ─── */

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}

/* ─── Main component ─── */

interface Props {
  steps: VisualizationStep[];
  index: number;
  playing: boolean;
  speed: number;
  meta: AlgorithmMeta;
  onToggle: () => void;
  onSeek: (i: number) => void;
  onSpeedChange: (s: number) => void;
  onRandomize: () => void;
  onReset: () => void;
}

export function PlaybackBar({
  steps,
  index,
  playing,
  speed,
  meta,
  onToggle,
  onSeek,
  onSpeedChange,
  onRandomize,
  onReset,
}: Props) {
  const step = steps[index];
  const atStart = index === 0;
  const atEnd = index >= steps.length - 1;
  const kinds = useMemo(() => steps.map(dominant), [steps]);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!timelineRef.current) return;
    const buttons = timelineRef.current.querySelectorAll("button");
    buttons[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index]);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Emergent-style description + complexity bar ──────────── */}
      <div
        className="flex items-stretch gap-0 overflow-hidden rounded-xl border border-border bg-card"
        aria-live="polite"
      >
        {/* STEP label + description */}
        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
          <span className="mb-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Step
          </span>
          <p className="text-sm leading-relaxed text-foreground">{step.description}</p>
        </div>

        {/* Right stat group — worst-case TC, SC, Category */}
        <div className="flex shrink-0 items-center gap-6 border-l border-border px-5 py-3">
          <StatPill label="Time" value={meta.timeComplexity.worst} />
          <StatPill label="Space" value={meta.spaceComplexity} />
          <StatPill label="Category" value={meta.category} />
        </div>
      </div>

      {/* ── Controls + Timeline card ─────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4">
        {/* Transport + Speed */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <IconAction label="Reset to start" onClick={onReset} disabled={atStart && !playing}>
              <RotateCcw className="size-4" />
            </IconAction>
            <IconAction label="Step backward" onClick={() => onSeek(index - 1)} disabled={atStart}>
              <SkipBack className="size-4" />
            </IconAction>
            <IconAction label={playing ? "Pause" : "Play"} onClick={onToggle} primary>
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </IconAction>
            <IconAction
              label="Step forward"
              onClick={() => onSeek(index + 1)}
              disabled={atEnd}
            >
              <SkipForward className="size-4" />
            </IconAction>
            <IconAction label="Shuffle new array" onClick={onRandomize}>
              <Shuffle className="size-4" />
            </IconAction>
          </div>

          {/* Speed slider */}
          <div className="flex min-w-44 flex-1 items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">Speed</span>
            <input
              type="range"
              aria-label="Playback speed"
              value={speed}
              min={1}
              max={10}
              step={1}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
            <span className="w-8 text-right font-mono text-xs tabular-nums text-muted-foreground">
              {speed}x
            </span>
          </div>
        </div>

        {/* Event timeline */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">Event timeline</span>
            <span className="font-mono tabular-nums">
              {index + 1} / {steps.length}
            </span>
          </div>
          <div
            ref={timelineRef}
            role="slider"
            aria-label="Execution timeline"
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-valuenow={index + 1}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") onSeek(Math.min(index + 1, steps.length - 1));
              if (e.key === "ArrowLeft") onSeek(Math.max(index - 1, 0));
            }}
            className="flex h-8 items-stretch gap-px overflow-x-auto rounded-lg border border-border bg-muted/40 p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {kinds.map((kind, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to step ${i + 1}`}
                onClick={() => onSeek(i)}
                className={cn(
                  "group relative min-w-0 flex-1 rounded-[2px] transition-all",
                  segColor[kind] ?? "bg-viz-idle",
                  i === index
                    ? "opacity-100 ring-2 ring-foreground ring-offset-1 ring-offset-background"
                    : "opacity-45 hover:opacity-80",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

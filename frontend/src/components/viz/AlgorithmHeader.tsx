import type { AlgorithmMeta } from "@/types/visualization";
import { cn } from "@/lib/utils";

interface Props {
  meta: AlgorithmMeta;
}

export function AlgorithmHeader({ meta }: Props) {
  return (
    <div className="border-b border-border bg-background/60">
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">{meta.name}</h1>
            <span className="rounded-full border border-cat-2/30 bg-cat-2/10 px-2 py-0.5 text-[11px] font-medium text-cat-2">
              {meta.category}
            </span>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
              {meta.stable ? "Stable" : "Unstable"}
            </span>
          </div>
        </div>

        <dl className="flex flex-wrap items-center gap-2">
          {[
            { label: "Best", value: meta.timeComplexity.best, color: "text-emerald-500" },
            { label: "Average", value: meta.timeComplexity.average, color: "text-amber-500" },
            { label: "Worst", value: meta.timeComplexity.worst, color: "text-rose-500" },
            { label: "Space", value: meta.spaceComplexity, color: "text-cyan-500" },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-md border border-border bg-gradient-to-b from-elevated to-surface px-2.5 py-1.5 text-center"
            >
              <dt className="eyebrow">{c.label}</dt>
              <dd className={cn("mt-0.5 font-mono text-[12px] font-medium", c.color || "text-surface-foreground")}>
                {c.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

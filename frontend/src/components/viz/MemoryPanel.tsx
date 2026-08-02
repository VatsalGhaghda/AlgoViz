/**
 * MemoryPanel — Phase 9.9
 *
 * Renders per-step variable values as a visual flat-box memory layout.
 * - Primitives (int, float, str, bool, None): labeled box, type-coloured
 * - list / tuple: horizontal row of indexed cells (mirrors ArrayCanvas style)
 * - dict: key→value pair rows
 * - set: unordered cells
 * - Scope section headers: "Local Variables" / "Global Variables"
 * - Pulse animation on changed variables
 * - No pointer arrows, no heap graph, no reference visualisation
 *
 * ArrayCanvas.tsx is NOT modified.
 */

import { useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type { VariableEntry } from "@/types/python-execution";

// ── Type → display config ────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; border: string; text: string; bg: string }> = {
  int:     { label: "int",   border: "border-cyan-500/60",   text: "text-cyan-300",   bg: "bg-cyan-500/10"   },
  float:   { label: "float", border: "border-sky-500/60",    text: "text-sky-300",    bg: "bg-sky-500/10"    },
  str:     { label: "str",   border: "border-amber-500/60",  text: "text-amber-300",  bg: "bg-amber-500/10"  },
  bool:    { label: "bool",  border: "border-emerald-500/60",text: "text-emerald-300",bg: "bg-emerald-500/10" },
  NoneType:{ label: "None",  border: "border-zinc-600/60",   text: "text-zinc-400",   bg: "bg-zinc-800/60"   },
  list:    { label: "list",  border: "border-violet-500/60", text: "text-violet-300", bg: "bg-violet-500/10"  },
  tuple:   { label: "tuple", border: "border-purple-500/60", text: "text-purple-300", bg: "bg-purple-500/10"  },
  dict:    { label: "dict",  border: "border-rose-500/60",   text: "text-rose-300",   bg: "bg-rose-500/10"   },
  set:     { label: "set",   border: "border-orange-500/60", text: "text-orange-300", bg: "bg-orange-500/10"  },
};

const DEFAULT_CONFIG = { label: "obj", border: "border-zinc-600/60", text: "text-zinc-400", bg: "bg-zinc-800/60" };

function typeConfig(t: string) {
  return TYPE_CONFIG[t] ?? DEFAULT_CONFIG;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPrimitive(value: unknown): string {
  if (value === null || value === undefined) return "None";
  if (typeof value === "string") return `"${value.length > 20 ? value.slice(0, 20) + "…" : value}"`;
  return String(value);
}

// ── Sub-renderers ────────────────────────────────────────────────────────────

/** Primitive: int / float / str / bool / None */
function PrimitiveBox({
  name, entry,
}: {
  name: string;
  entry: VariableEntry;
}) {
  const cfg = typeConfig(entry.type);
  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Variable name label + changed dot (inline, no overflow) */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-medium text-muted-foreground font-mono">{name}</span>
        {entry.changed && (
          <span className="size-1.5 rounded-full bg-accent animate-pulse" />
        )}
      </div>
      {/* Value box — ring only, no absolute dot to overflow */}
      <motion.div
        layout
        animate={entry.changed ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 0.25 }}
        className={cn(
          "flex min-w-[52px] items-center justify-center rounded-lg border px-3 py-2",
          cfg.border, cfg.bg,
          entry.changed && "ring-2 ring-accent ring-offset-1 ring-offset-background",
        )}
      >
        <span className={cn("font-mono text-[13px] font-semibold", cfg.text)}>
          {formatPrimitive(entry.value)}
        </span>
      </motion.div>
      {/* Type badge */}
      <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", cfg.bg, cfg.text)}>
        {entry.type === "NoneType" ? "None" : entry.type}
      </span>
    </div>
  );
}

/** List / Tuple: horizontal indexed cell row */
function SequenceRow({
  name, entry,
}: {
  name: string;
  entry: VariableEntry;
}) {
  const cfg = typeConfig(entry.type);
  const items: unknown[] = Array.isArray(entry.value) ? entry.value : [];
  const display = items.slice(0, 12); // cap at 12 for display
  const truncated = items.length > 12;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] font-medium text-muted-foreground font-mono">{name}</span>
        <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", cfg.bg, cfg.text)}>
          {entry.type}[{items.length}]
        </span>
        {entry.changed && <span className="size-1.5 rounded-full bg-accent animate-pulse" />}
      </div>
      <div className="flex flex-wrap items-center gap-px">
        {display.map((val, idx) => (
          <div key={idx} className={cn(
            "flex flex-col items-center rounded border",
            cfg.border,
          )}>
            <span className={cn("px-2 py-1 font-mono text-[12px] font-medium", cfg.text, cfg.bg)}>
              {formatPrimitive(val)}
            </span>
            <span className="border-t border-border/50 px-2 py-0.5 text-[9px] text-zinc-600 font-mono">
              {idx}
            </span>
          </div>
        ))}
        {truncated && (
          <div className={cn("flex items-center rounded border px-2 py-1", cfg.border, cfg.bg)}>
            <span className={cn("font-mono text-[11px]", cfg.text)}>+{items.length - 12}</span>
          </div>
        )}
        {items.length === 0 && (
          <span className="text-[11px] text-muted-foreground italic">empty</span>
        )}
      </div>
    </div>
  );
}

/** Dict: key → value pair table */
function DictBox({
  name, entry,
}: {
  name: string;
  entry: VariableEntry;
}) {
  const cfg = typeConfig("dict");
  const pairs: [string, unknown][] = typeof entry.value === "object" && entry.value !== null && !Array.isArray(entry.value)
    ? Object.entries(entry.value as Record<string, unknown>).slice(0, 8)
    : [];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] font-medium text-muted-foreground font-mono">{name}</span>
        <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", cfg.bg, cfg.text)}>
          dict
        </span>
        {entry.changed && <span className="size-1.5 rounded-full bg-accent animate-pulse" />}
      </div>
      <div className={cn("rounded-lg border overflow-hidden", cfg.border)}>
        {pairs.length === 0 ? (
          <p className="px-3 py-1.5 text-[11px] text-muted-foreground italic">empty</p>
        ) : (
          <table className="w-full text-[11px]">
            <tbody>
              {pairs.map(([k, v], i) => (
                <tr key={k} className={cn(i > 0 && "border-t border-border/50")}>
                  <td className={cn("px-2.5 py-1 font-mono font-medium", cfg.text, cfg.bg)}>
                    {formatPrimitive(k)}
                  </td>
                  <td className="px-2 py-1 text-zinc-500">→</td>
                  <td className="px-2.5 py-1 font-mono text-foreground">
                    {formatPrimitive(v)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/** Set: unordered value cells */
function SetBox({
  name, entry,
}: {
  name: string;
  entry: VariableEntry;
}) {
  const cfg = typeConfig("set");
  const items: unknown[] = Array.isArray(entry.value) ? entry.value : [];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] font-medium text-muted-foreground font-mono">{name}</span>
        <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", cfg.bg, cfg.text)}>
          set
        </span>
        {entry.changed && <span className="size-1.5 rounded-full bg-accent animate-pulse" />}
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map((val, idx) => (
          <span key={idx} className={cn("rounded border px-2 py-1 font-mono text-[12px] font-medium", cfg.border, cfg.bg, cfg.text)}>
            {formatPrimitive(val)}
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-[11px] text-muted-foreground italic">empty set</span>
        )}
      </div>
    </div>
  );
}

// ── Variable renderer — routes to the correct sub-component ─────────────────

function VariableBlock({ name, entry }: { name: string; entry: VariableEntry }) {
  switch (entry.type) {
    case "list":
    case "tuple":
      return <SequenceRow name={name} entry={entry} />;
    case "dict":
      return <DictBox name={name} entry={entry} />;
    case "set":
      return <SetBox name={name} entry={entry} />;
    default:
      return <PrimitiveBox name={name} entry={entry} />;
  }
}

// ── Scope section ────────────────────────────────────────────────────────────

function ScopeSection({
  title, vars,
}: {
  title: string;
  vars: [string, VariableEntry][];
}) {
  if (vars.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-4 px-1">
        <AnimatePresence initial={false}>
          {vars.map(([name, entry]) => (
            <motion.div
              key={name}
              data-var-card
              data-changed={entry.changed ? "true" : "false"}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
            >
              <VariableBlock name={name} entry={entry} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Public component ─────────────────────────────────────────────────────────

export interface MemoryPanelProps {
  localVars:  [string, VariableEntry][];
  globalVars: [string, VariableEntry][];
}

export function MemoryPanel({ localVars, globalVars }: MemoryPanelProps) {
  const isEmpty = localVars.length === 0 && globalVars.length === 0;

  // Auto-scroll to the first changed variable (same pattern as VariablesPanel)
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build a stable key from the names of currently-changed variables so the
  // effect only fires when the active variable actually changes.
  const changedKey = useMemo(() => {
    return [...localVars, ...globalVars]
      .filter(([, e]) => e.changed)
      .map(([n]) => n)
      .join(",");
  }, [localVars, globalVars]);

  useEffect(() => {
    if (!scrollRef.current || !changedKey) return;
    // Use block:"start" so the active card is scrolled to the TOP of the panel,
    // maximising the visible portion for tall structures (dicts, long lists, etc.).
    // block:"nearest" only scrolled the minimum, which left tall cards cut off.
    const card = scrollRef.current.querySelector('[data-changed="true"]');
    card?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [changedKey]);

  return (
    // scrollRef lives on the overflow container — same pattern as VariablesPanel.
    // pb-10 ensures the last card/structure is never flush-cut at the panel edge.
    <div ref={scrollRef} className="min-h-0 overflow-y-auto p-4 pb-10">
      {isEmpty ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-[12px] text-muted-foreground">No variables in scope</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <ScopeSection title="Local Variables"  vars={localVars}  />
          <ScopeSection title="Global Variables" vars={globalVars} />
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  FileCode2,
  Variable,
} from "lucide-react";

import { BarsCanvas, BARS_LEGEND, SEARCH_LEGEND } from "@/components/viz/BarsCanvas";
import { GraphCanvas, GRAPH_LEGEND } from "@/components/viz/GraphCanvas";
import { LinkedListCanvas, LINKED_LIST_LEGEND } from "@/components/viz/LinkedListCanvas";
import { ArrayCanvas, ARRAY_LEGEND } from "@/components/viz/ArrayCanvas";
import { StackCanvas, STACK_LEGEND } from "@/components/viz/StackCanvas";
import { QueueCanvas, QUEUE_LEGEND } from "@/components/viz/QueueCanvas";
import { CodePanel } from "@/components/viz/CodePanel";
import { VariablesPanel } from "@/components/viz/VariablesPanel";
import { PlaybackBar } from "@/components/viz/PlaybackBar";
import { CollapsiblePanel } from "@/components/viz/CollapsiblePanel";
import { cn } from "@/lib/utils";
import { ALGORITHM_REGISTRY } from "@/lib/algorithms";
import { randomArray, DEFAULT_ARRAY } from "@/lib/algorithms/utils";

export function WorkspacePage() {
  const { category, operation } = useParams();

  // Try direct operation first (e.g. 'bubble-sort'), then category-operation fallback (e.g. 'linked-list-create')
  const lookupKey = operation || category || "";
  const entry = ALGORITHM_REGISTRY[lookupKey] || ALGORITHM_REGISTRY[`${category}-${operation}`];

  if (!entry) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Algorithm not found.</p>
      </div>
    );
  }

  const { meta, generate } = entry;

  /* ── Algorithm state ─────────────────────────────────────────── */
  const [input, setInput] = useState<number[]>(DEFAULT_ARRAY);
  const [targetStr, setTargetStr] = useState<string>("");
  const [valueStr, setValueStr] = useState<string>("99");
  const [index, setIndex] = useState(0);
  const [codeCopied, setCodeCopied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  const parsedTarget = parseInt(targetStr, 10);
  const targetVal = !isNaN(parsedTarget) ? parsedTarget : undefined;
  
  const parsedValue = parseInt(valueStr, 10);
  const insertVal = !isNaN(parsedValue) ? parsedValue : undefined;

  const steps = useMemo(() => generate(input, targetVal, insertVal), [input, targetVal, insertVal, generate]);
  const clampedIndex = Math.min(index, steps.length - 1);
  const step = steps[clampedIndex];

  void (steps.length === 1 && steps[0].description.includes("not valid")); // hasError — reserved

  useEffect(() => { 
    setIndex(0); 
    setPlaying(false); 
    if (meta.category === "Graphs") {
      setTargetStr(meta.startNode?.toString() ?? "0");
    } else {
      setTargetStr("5");
    }
  }, [input, lookupKey, meta]);

  useEffect(() => {
    if (lookupKey.includes("insert")) {
      setInput(prev => prev.length > 5 ? prev.slice(0, 5) : prev);
    }
  }, [lookupKey]);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!playing) return;
    if (clampedIndex >= steps.length - 1) { setPlaying(false); return; }
    const delay = 1050 - speed * 95;
    timer.current = setTimeout(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), delay);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [playing, clampedIndex, speed, steps.length]);

  const handleToggle = useCallback(() => {
    if (clampedIndex >= steps.length - 1) { setIndex(0); setPlaying(true); }
    else setPlaying((p) => !p);
  }, [clampedIndex, steps.length]);

  const handleSeek = useCallback((i: number) => { setPlaying(false); setIndex(Math.max(0, Math.min(i, steps.length - 1))); }, [steps.length]);
  const handleRandomize = useCallback(() => setInput(randomArray(input.length)), [input.length]);
  const handleReset = useCallback(() => { setPlaying(false); setIndex(0); }, []);
  const handleSpeed = useCallback((s: number) => setSpeed(s), []);

  /* ── Panel visibility ────────────────────────────────────────── */
  const [showViz, setShowViz] = useState(true);
  const [showPlayback, setShowPlayback] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ── Derived elements ────────────────────────────────────────── */
  const isSearch = meta.category === "Searching" || meta.id === "linked-list-search";
  const hasIndexInput = meta.id === "linked-list-insert-position" || meta.id === "linked-list-delete-position" || meta.id === "array-access" || meta.id === "array-update" || meta.id === "array-insert-index" || meta.id === "array-delete-index";
  const hasValueInput = meta.id === "linked-list-insert-position" || meta.id === "array-update" || meta.id === "array-insert-index";
  const hasSingleValueInput = meta.id === "linked-list-insert-beginning" || meta.id === "linked-list-insert-end" || meta.id === "array-insert-beginning" || meta.id === "array-insert-end";
  const isGraph = meta.category === "Graphs";
  const isLinkedList = meta.category === "Linked List";
  const isArray = meta.category === "Arrays";
  const isStack = meta.category === "Stacks";
  const isQueue = meta.category === "Queues";
  const activeLegend = isGraph ? GRAPH_LEGEND : isLinkedList ? LINKED_LIST_LEGEND : isStack ? STACK_LEGEND : isQueue ? QUEUE_LEGEND : isArray ? ARRAY_LEGEND : (isSearch ? SEARCH_LEGEND : BARS_LEGEND);

  const legendEl = (
    <ul className="flex items-center gap-3">
      {activeLegend.map((l) => (
        <li key={l.label} className="flex items-center gap-1.5">
          <span className={cn("size-1.5 rounded-full", l.className)} aria-hidden="true" />
          <span className="text-[11px] text-muted-foreground">{l.label}</span>
        </li>
      ))}
    </ul>
  );

  const liveBadge = (
    <span className="flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
      <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
      Live
    </span>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* AlgorithmHeader removed — name moved to panel label, TC/SC moved to PlaybackBar */}
      {/* ── Workspace body ─────────────────────────────────────────── */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">

        {/* ── Main column ──────────────────────────────────────────── */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3">

          {/* Array / Graph / Linked List State panel — collapsible with header toggle */}
          <CollapsiblePanel
            label={
              <div className="flex items-center gap-6">
                <span>{isGraph ? "Graph State" : isLinkedList ? "Linked List State" : isStack ? "Stack State" : isQueue ? "Queue State" : "Array State"} — {meta.name}</span>
                {(isSearch || hasIndexInput || hasSingleValueInput) && (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      {hasSingleValueInput ? "Value" : (hasIndexInput ? "Index" : "Target")}
                    </span>
                    <input
                      type="text"
                      className="w-16 rounded border border-white/10 bg-black/20 px-2 py-0.5 text-xs text-white outline-none focus:border-accent/50 transition-colors"
                      value={targetStr}
                      onChange={(e) => setTargetStr(e.target.value)}
                    />
                    {hasValueInput && (
                      <>
                        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase ml-2">
                          Value
                        </span>
                        <input
                          type="text"
                          className="w-16 rounded border border-white/10 bg-black/20 px-2 py-0.5 text-xs text-white outline-none focus:border-accent/50 transition-colors"
                          value={valueStr}
                          onChange={(e) => setValueStr(e.target.value)}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            }
            icon={<BarChart2 className="size-3.5" />}
            open={showViz}
            onToggle={() => setShowViz((v) => !v)}
            headerActions={legendEl}
            hideToggle={true}
            className="min-h-0 flex-1"
            bodyClassName="flex flex-col min-h-0"
          >
            {isGraph ? (
              <GraphCanvas step={step} meta={meta} />
            ) : isLinkedList ? (
              <LinkedListCanvas step={step} meta={meta} />
            ) : isArray ? (
              <ArrayCanvas step={step} meta={meta} />
            ) : isStack ? (
              <StackCanvas step={step} meta={meta} />
            ) : isQueue ? (
              <QueueCanvas step={step} meta={meta} />
            ) : (
              <BarsCanvas step={step} />
            )}
          </CollapsiblePanel>

          {/* ── Playback collapse divider — small centered pill ────── */}
          <div className="my-1 flex shrink-0 items-center justify-center">
            <button
              type="button"
              aria-label={showPlayback ? "Collapse playback controls" : "Expand playback controls"}
              onClick={() => setShowPlayback((v) => !v)}
              className={cn(
                "flex h-5 w-14 items-center justify-center",
                "rounded-full border border-border bg-elevated",
                "text-muted-foreground transition-colors",
                "hover:border-border-strong hover:bg-muted hover:text-foreground",
              )}
            >
              {showPlayback
                ? <ChevronDown className="size-3" />
                : <ChevronUp className="size-3" />}
            </button>
          </div>

          {/* Playback controls — no header, collapses via the pill above */}
          <AnimatePresence initial={false}>
            {showPlayback && (
              <motion.div
                key="playback"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="shrink-0 overflow-hidden"
              >
                <PlaybackBar
                  steps={steps}
                  index={clampedIndex}
                  playing={playing}
                  speed={speed}
                  meta={meta}
                  onToggle={handleToggle}
                  onSeek={handleSeek}
                  onSpeedChange={handleSpeed}
                  onRandomize={handleRandomize}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Sidebar horizontal collapse rail ─────────────────────── */}
        <button
          type="button"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          onClick={() => setSidebarOpen((o) => !o)}
          className={cn(
            "relative z-10 my-auto flex h-12 w-4 shrink-0 items-center justify-center",
            "rounded-full border border-border bg-elevated shadow-md",
            "text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground",
          )}
        >
          {sidebarOpen
            ? <ChevronRight className="size-3" />
            : <ChevronLeft className="size-3" />}
        </button>

        {/* ── Side column ──────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "clamp(420px, 36%, 600px)", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="flex min-h-0 flex-col gap-2 overflow-hidden p-3"
            >
              {/* ── Code panel — static height, no toggle ─────────────
                   Fixed height so Variables below it can't shrink it.
                   The code body scrolls internally.
              ───────────────────────────────────────────────────── */}
              <section
                className="panel flex shrink-0 flex-col overflow-hidden"
                style={{ height: "364px" }}
                aria-label="Source code"
              >
                {/* Plain non-collapsible header */}
                <div className="panel-header justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    <span className="font-mono text-[12px] text-surface-foreground">
                      {meta.id.replace(/-/g, "_")}.{meta.language === "python" ? "py" : "ts"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      title="Copy code"
                      onClick={() => {
                        navigator.clipboard.writeText(meta.codeLines.join("\n"));
                        setCodeCopied(true);
                        setTimeout(() => setCodeCopied(false), 1500);
                      }}
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/60 hover:text-cyan-400 transition-colors"
                    >
                      {codeCopied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                      {codeCopied ? "Copied!" : "Copy"}
                    </button>
                    <span className="eyebrow">{meta.language === "python" ? "Python" : "TypeScript"}</span>
                  </div>
                </div>
                <CodePanel
                  code={meta.codeLines}
                  activeLine={step.line}
                />
              </section>

              {/* ── Variables panel — auto-height, no toggle ──────────── */}
              <section
                className="panel flex shrink-0 flex-col overflow-hidden"
                style={{ height: "276px" }}
                aria-label="Variables"
              >
                <div className="panel-header justify-between">
                  <div className="flex items-center gap-2">
                    <Variable className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    <span className="eyebrow">Variables</span>
                  </div>
                  {liveBadge}
                </div>
                {/* overflow-y-auto: scrolls when more than 5 vars */}
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                  <VariablesPanel step={step} />
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

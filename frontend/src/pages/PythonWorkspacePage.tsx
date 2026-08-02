/**
 * PythonWorkspacePage — Phases 9.2–9.12 + Layout Redesign
 *
 * Layout changes:
 * - Left panel capped at ~50% width; editor fills remaining height
 * - Step Info panel removed; LINE/kind badge moved into playback controls bar
 * - Variables panel removed; Memory View is the sole variable display
 * - Right sidebar order: Memory View (default open) → Call Stack (default open)
 *   Console is shown as a swappable panel — user can replace Memory or Call Stack
 *   with Console via a toggle button on each panel header
 *
 * Bug fix:
 * - Import filtering moved to Python backend (variable_tracker.py)
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Code2,
  Command,
  Cpu,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Terminal,
  Zap,
} from "lucide-react";

import { MonacoEditor } from "@/components/viz/MonacoEditor";
import type { MonacoEditorHandle } from "@/components/viz/MonacoEditor";
import { CallStackPanel } from "@/components/viz/CallStackPanel";
import { ConsolePanel } from "@/components/viz/ConsolePanel";
import { MemoryPanel } from "@/components/viz/MemoryPanel";
import { ErrorBanner } from "@/components/viz/ErrorBanner";
import { CollapsiblePanel } from "@/components/viz/CollapsiblePanel";
import { useExecution } from "@/hooks/useExecution";
import { usePlayback } from "@/hooks/usePlayback";
import { cn } from "@/lib/utils";
import type {
  ExecutionStep,
  ExecutionStatus,
  VariableEntry,
} from "@/types/python-execution";

// ── Phase 9.11: Example snippets ──────────────────────────────────────────────

interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
}

const SNIPPETS: Snippet[] = [
  {
    id: "factorial",
    title: "Factorial (Recursion)",
    description: "Classic recursive factorial — watch the call stack grow and unwind",
    code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

result = factorial(5)
print(result)
`,
  },
  {
    id: "fibonacci",
    title: "Fibonacci Sequence",
    description: "Generate the first N Fibonacci numbers iteratively",
    code: `def fibonacci(n):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

nums = fibonacci(8)
print(nums)
`,
  },
  {
    id: "bubble-sort",
    title: "Bubble Sort",
    description: "Step through every comparison and swap in bubble sort",
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

data = [64, 34, 25, 12, 22, 11, 90]
sorted_data = bubble_sort(data)
print(sorted_data)
`,
  },
  {
    id: "binary-search",
    title: "Binary Search",
    description: "Visualize how binary search halves the search space each step",
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
result = binary_search(arr, 23)
print(f"Found at index: {result}")
`,
  },
  {
    id: "linked-list",
    title: "Linked List Node Append",
    description: "Build a linked list from scratch and traverse it",
    code: `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, value):
        new_node = Node(value)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node

    def to_list(self):
        result = []
        current = self.head
        while current:
            result.append(current.value)
            current = current.next
        return result

ll = LinkedList()
for v in [1, 2, 3, 4, 5]:
    ll.append(v)

print(ll.to_list())
`,
  },
  {
    id: "stack-ops",
    title: "Stack (Push / Pop)",
    description: "Trace push and pop operations on a simple Python stack",
    code: `stack = []

def push(val):
    stack.append(val)
    print(f"Pushed {val} → {stack}")

def pop():
    if not stack:
        print("Stack underflow!")
        return None
    val = stack.pop()
    print(f"Popped {val} → {stack}")
    return val

push(10)
push(20)
push(30)
pop()
pop()
push(99)
pop()
pop()
`,
  },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 500;
const VIRT_THRESHOLD = 250;
const VIRT_BUCKETS   = 120;

const STEP_KIND_COLOR: Record<string, string> = {
  line:    "bg-cyan-500",
  call:    "bg-amber-500",
  return:  "bg-purple-500",
  error:   "bg-rose-500",
  timeout: "bg-amber-400",
  limit:   "bg-zinc-500",
};

// Kind badge colour classes (text + bg) for the LINE pill
const KIND_BADGE: Record<string, string> = {
  line:    "bg-cyan-500/15 text-cyan-400",
  call:    "bg-amber-500/15 text-amber-400",
  return:  "bg-purple-500/15 text-purple-400",
  error:   "bg-rose-500/15 text-rose-400",
  timeout: "bg-amber-500/15 text-amber-400",
  limit:   "bg-zinc-500/15 text-zinc-400",
};

// ── Sidebar slot types ─────────────────────────────────────────────────────────
// The right sidebar has two fixed slots. Each slot can show one of three panels.
type SidebarPanel = "memory" | "callstack" | "console";

// ── Helpers ───────────────────────────────────────────────────────────────────

function splitByScope(vars: Record<string, VariableEntry>): {
  local:  [string, VariableEntry][];
  global: [string, VariableEntry][];
} {
  const local:  [string, VariableEntry][] = [];
  const global: [string, VariableEntry][] = [];
  for (const [name, entry] of Object.entries(vars)) {
    if (name.startsWith("__") || name === "_return_") continue;
    if (entry.scope === "global") global.push([name, entry]);
    else                          local.push([name, entry]);
  }
  return { local, global };
}

function statusIcon(status: ExecutionStatus | null) {
  switch (status) {
    case "completed":           return <CheckCircle2 className="size-3.5 text-emerald-400" />;
    case "runtime_error":
    case "syntax_error":
    case "sandbox_error":       return null;
    case "timeout":             return <Clock className="size-3.5 text-amber-400" />;
    case "trace_limit_reached": return <Zap className="size-3.5 text-amber-400" />;
    default:                    return null;
  }
}

// ── Virtualised timeline ───────────────────────────────────────────────────────

interface TimelineSegment {
  from: number;
  to: number;
  kind: string;
  active: boolean;
}

function buildTimeline(steps: ExecutionStep[], currentIdx: number): TimelineSegment[] {
  const n = steps.length;
  if (n === 0) return [];
  if (n <= VIRT_THRESHOLD) {
    return steps.map((s, i) => ({ from: i, to: i, kind: s.kind, active: i === currentIdx }));
  }
  const bucketSize = n / VIRT_BUCKETS;
  const segs: TimelineSegment[] = [];
  for (let b = 0; b < VIRT_BUCKETS; b++) {
    const from = Math.floor(b * bucketSize);
    const to   = Math.min(Math.ceil((b + 1) * bucketSize) - 1, n - 1);
    const kinds = steps.slice(from, to + 1).map((s) => s.kind);
    const kindFreq: Record<string, number> = {};
    for (const k of kinds) kindFreq[k] = (kindFreq[k] ?? 0) + 1;
    const dominant = Object.entries(kindFreq).sort((a, b) => b[1] - a[1])[0][0];
    segs.push({ from, to, kind: dominant, active: currentIdx >= from && currentIdx <= to });
  }
  return segs;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PlayBtn({
  label, onClick, disabled, primary, children,
}: {
  label: string; onClick: () => void; disabled?: boolean;
  primary?: boolean; children: React.ReactNode;
}) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid place-items-center rounded-lg transition-colors disabled:opacity-40",
        primary
          ? "size-9 bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_var(--color-primary)] hover:opacity-90"
          : "size-8 border border-border bg-elevated text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

// ── Snippets Dropdown ─────────────────────────────────────────────────────────

function SnippetsDropdown({ onSelect }: { onSelect: (s: Snippet) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button" id="python-snippets-btn"
        aria-label="Example snippets" aria-haspopup="listbox" aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5",
          "text-[13px] font-medium text-muted-foreground transition-colors",
          "hover:bg-muted hover:text-foreground",
          open && "bg-muted text-foreground",
        )}
      >
        <BookOpen className="size-3.5" />
        Examples
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div key="dropdown"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            role="listbox" aria-label="Choose an example"
            className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-xl border border-border bg-popover shadow-2xl overflow-hidden"
          >
            <div className="border-b border-border px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Example Programs</p>
            </div>
            <ul className="max-h-72 overflow-y-auto py-1">
              {SNIPPETS.map((s) => (
                <li key={s.id}>
                  <button type="button" role="option"
                    onClick={() => { onSelect(s); setOpen(false); }}
                    className="w-full px-3 py-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <p className="text-[12px] font-medium text-foreground">{s.title}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{s.description}</p>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sidebar panel wrapper with optional swap button ────────────────────────────

function SidebarSlot({
  title, icon, badge, canSwapTo, swapLabel, onSwap, contentClassName, className, children,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  canSwapTo?: SidebarPanel;
  swapLabel?: string;
  onSwap?: () => void;
  contentClassName?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("panel flex min-h-0 flex-col overflow-hidden", className)}>
      <div className="panel-header justify-between shrink-0">
        <div className="flex items-center gap-2">{icon}<span className="eyebrow">{title}</span></div>
        <div className="flex items-center gap-2">
          {badge}
          {onSwap && canSwapTo && (
            <button
              type="button"
              onClick={onSwap}
              title={`Show ${swapLabel} here`}
              aria-label={`Switch to ${swapLabel}`}
              className="flex items-center gap-1 rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              <Terminal className="size-2.5" />
              {swapLabel}
            </button>
          )}
        </div>
      </div>
      <div className={cn("min-h-0 flex-1 overflow-y-auto", contentClassName)}>
        {children}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PythonWorkspacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const snippetParam = searchParams.get("snippet");
  
  const [code, setCode] = useState(() => {
    const s = SNIPPETS.find((s) => s.id === snippetParam);
    return s ? s.code : SNIPPETS[0].code;
  });
  const [activeSnippetId, setActiveSnippetId] = useState<string>(() => {
    const s = SNIPPETS.find((s) => s.id === snippetParam);
    return s ? s.id : "factorial";
  });

  // Watch for URL changes (e.g. from Search Modal navigation)
  useEffect(() => {
    if (snippetParam) {
      const s = SNIPPETS.find((s) => s.id === snippetParam);
      if (s && s.id !== activeSnippetId) {
        setCode(s.code);
        setActiveSnippetId(s.id);
      }
    }
  }, [snippetParam, activeSnippetId]);

  const monacoRef  = useRef<MonacoEditorHandle>(null);
  const lastRunRef = useRef<number>(0);

  const { steps, status, isLoading, error, execute } = useExecution();
  const playback = usePlayback(steps.length);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [showPlayback,   setShowPlayback]   = useState(true);
  const [errorDismissed, setErrorDismissed] = useState(false);

  // The bottom slot defaults to callstack but can be swapped to console
  const [bottomSlot, setBottomSlot] = useState<SidebarPanel>("callstack");

  useEffect(() => { if (isLoading) setErrorDismissed(false); }, [isLoading]);

  // ── Current step ──────────────────────────────────────────────────────────
  const currentStep: ExecutionStep | null = steps[playback.index] ?? null;

  const { localVars, globalVars } = useMemo(() => {
    if (!currentStep) return { localVars: [] as [string, VariableEntry][], globalVars: [] as [string, VariableEntry][] };
    const { local, global } = splitByScope(currentStep.vars ?? {});
    return { localVars: local, globalVars: global };
  }, [currentStep]);

  const callStackFrames = useMemo(() => currentStep?.call_stack ?? [], [currentStep]);

  // Monaco line highlight
  useEffect(() => {
    if (!currentStep) { monacoRef.current?.clearHighlights(); return; }
    const style = currentStep.kind === "error" ? "error" : currentStep.kind === "timeout" ? "timeout" : "active";
    monacoRef.current?.highlightLine(currentStep.line, style);
  }, [currentStep]);

  useEffect(() => {
    if (isLoading) { monacoRef.current?.clearHighlights(); monacoRef.current?.clearErrorMarker(); }
  }, [isLoading]);

  // Monaco error gutter marker
  useEffect(() => {
    const errStep =
      (status === "syntax_error"  && steps[0]?.kind === "error") ? steps[0] :
      (status === "runtime_error" && currentStep?.kind === "error") ? currentStep :
      // Also set a gutter marker for the trace-limit error step
      (status === "trace_limit_reached" && steps[steps.length - 1]?.kind === "error") ? steps[steps.length - 1] :
      null;
    if (errStep && errStep.line > 0) {
      monacoRef.current?.setErrorMarker(errStep.line, errStep.error_message ?? errStep.error_type ?? "Error");
    } else {
      monacoRef.current?.clearErrorMarker();
    }
  }, [status, currentStep, steps]);

  // When the trace limit is hit, seek to the last step immediately so the
  // error line is highlighted in Monaco. This must run before the
  // hasSteps=false gate hides the playback controls.
  useEffect(() => {
    if (status === "trace_limit_reached" && steps.length > 0) {
      playback.seek(steps.length - 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, steps.length]);

  // ── Run (debounced) ───────────────────────────────────────────────────────
  const handleRun = useCallback(() => {
    const now = Date.now();
    if (now - lastRunRef.current < DEBOUNCE_MS) return;
    lastRunRef.current = now;
    playback.restart();
    execute(code);
  }, [code, execute, playback]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleRun(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRun]);

  const handleSnippetSelect = useCallback((snippet: Snippet) => {
    setCode(snippet.code);
    setActiveSnippetId(snippet.id);
    monacoRef.current?.clearHighlights();
    monacoRef.current?.clearErrorMarker();
  }, []);

  // ── Virtualised timeline ──────────────────────────────────────────────────
  const timelineSegments = useMemo(
    () => buildTimeline(steps, playback.index),
    [steps, playback.index],
  );

  // ── Derived ───────────────────────────────────────────────────────────────
  // When the trace limit is hit the playback controls are hidden entirely so
  // the user is never exposed to 10,000 meaningless intermediate steps.
  // The error banner and Monaco highlight still work via the limit error step.
  const hasSteps    = steps.length > 0 && status !== "trace_limit_reached";
  const isTruncated = status === "trace_limit_reached";
  const isTimedOut  = status === "timeout";
  const varCount    = localVars.length + globalVars.length;

  const syntaxErrorStep  = status === "syntax_error"  && steps[0]?.kind === "error" ? steps[0] : null;
  const runtimeErrorStep = status === "runtime_error" && currentStep?.kind === "error" ? currentStep : null;
  // trace_limit_reached: the last step has kind="error" with error_type="TraceLimitReached"
  const limitErrorStep   = status === "trace_limit_reached" && steps[steps.length - 1]?.kind === "error"
    ? steps[steps.length - 1]
    : null;
  const activeErrorStep  = syntaxErrorStep ?? runtimeErrorStep ?? limitErrorStep;
  const showErrorBanner  = !!activeErrorStep && !errorDismissed;
  const apiErrorMsg      = error && !activeErrorStep ? error.message : null;
  const isVirtualised    = steps.length > VIRT_THRESHOLD;

  const consoleOutput = useMemo(
    () => steps.slice(0, playback.index + 1).map((s) => s.output).filter(Boolean).join(""),
    [steps, playback.index],
  );

  // ── Slot swap helpers ─────────────────────────────────────────────────────
  const swapBottomToConsole = useCallback(() => {
    setBottomSlot("console");
  }, []);

  const swapBottomBack = useCallback(() => {
    setBottomSlot("callstack");
  }, []);

  // ── Panel renderers ───────────────────────────────────────────────────────

  function renderMemory() {
    return (
      <div className="flex-1 min-h-0">
        <MemoryPanel localVars={localVars} globalVars={globalVars} />
      </div>
    );
  }

  function renderCallStack() {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto">
        <CallStackPanel
          frames={hasSteps ? callStackFrames : []}
          currentLine={currentStep?.line ?? 0}
        />
      </div>
    );
  }

  function renderConsole() {
    return (
      <div className="flex-1 min-h-0" style={{ minHeight: "8rem" }}>
        <ConsolePanel steps={steps} currentStepIndex={playback.index} />
      </div>
    );
  }

  function getSlotContent(slot: SidebarPanel) {
    if (slot === "memory")    return renderMemory();
    if (slot === "callstack") return renderCallStack();
    return renderConsole();
  }

  function getSlotTitle(slot: SidebarPanel) {
    if (slot === "memory")    return "Memory View";
    if (slot === "callstack") return "Call Stack";
    return "Console";
  }

  function getSlotIcon(slot: SidebarPanel) {
    if (slot === "memory") return <Cpu className="size-3.5 text-muted-foreground" aria-hidden />;
    if (slot === "callstack") return (
      <svg className="size-3.5 text-muted-foreground" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <rect x="2" y="2"    width="12" height="3.5" rx="1" />
        <rect x="2" y="6.25" width="12" height="3.5" rx="1" />
        <rect x="2" y="10.5" width="12" height="3.5" rx="1" />
      </svg>
    );
    return <Terminal className="size-3.5 text-muted-foreground" aria-hidden />;
  }

  function getSlotBadge(slot: SidebarPanel) {
    if (slot === "memory" && varCount > 0) {
      return (
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {varCount} var{varCount !== 1 ? "s" : ""}
        </span>
      );
    }
    if (slot === "callstack" && callStackFrames.length > 0) {
      return (
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          depth {callStackFrames.length}
        </span>
      );
    }
    if (slot === "console" && consoleOutput) {
      return (
        <span className="flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          output
        </span>
      );
    }
    return undefined;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <Code2 className="size-5 text-primary" />
          <div>
            <h1 className="text-[13px] font-semibold text-foreground">Python Visualizer</h1>
            <p className="text-[10px] text-muted-foreground">Step through code execution, live</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SnippetsDropdown onSelect={handleSnippetSelect} />

          <AnimatePresence>
            {hasSteps && (
              <motion.span key="badge"
                initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.88 }}
                className="flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1 font-mono text-[11px] text-muted-foreground"
              >
                {statusIcon(status)}
                {steps.length.toLocaleString()} step{steps.length !== 1 ? "s" : ""}
              </motion.span>
            )}
          </AnimatePresence>

          <button
            type="button" id="python-run-btn" onClick={handleRun} disabled={isLoading}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors",
              "bg-emerald-600 text-white",
              "hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {isLoading
              ? <><Loader2 className="size-4 animate-spin" />Running…</>
              : <>
                  <Play className="size-4" />
                  Run Code
                </>
            }
          </button>
        </div>
      </div>

      {/* ── Workspace ────────────────────────────────────────────────────── */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">

        {/* ── Left: editor + playback — capped at ~50% ──────────────────── */}
        <div
          className="flex min-h-0 min-w-0 flex-col overflow-hidden p-3"
          style={{ width: "clamp(320px, 50%, 780px)" }}
        >
          {/* Editor */}
          <CollapsiblePanel
            label="main.py"
            icon={<Terminal className="size-3.5" />}
            open={true} onToggle={() => {}} hideToggle={true}
            className="min-h-0 flex-1"
            bodyClassName="flex flex-col min-h-0"
            headerActions={
              <div className="flex items-center gap-2">
                {activeSnippetId && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {SNIPPETS.find((s) => s.id === activeSnippetId)?.title ?? "Custom"}
                  </span>
                )}
                {isLoading && (
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />Executing…
                  </span>
                )}
                {status && !isLoading && (
                  <span className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    status === "completed" && "bg-emerald-500/10 text-emerald-400",
                    (status === "runtime_error" || status === "syntax_error") && "bg-rose-500/10 text-rose-400",
                    (status === "timeout" || status === "trace_limit_reached") && "bg-amber-500/10 text-amber-400",
                  )}>
                    {statusIcon(status)}
                    {status === "completed"           && "Completed"}
                    {status === "runtime_error"       && "Runtime error"}
                    {status === "syntax_error"        && "Syntax error"}
                    {status === "timeout"             && "Timed out"}
                    {status === "trace_limit_reached" && "Trace truncated"}
                  </span>
                )}
                <span className="eyebrow">Python 3</span>
              </div>
            }
          >
            <div className="relative flex flex-1 flex-col min-h-0">
              <MonacoEditor
                ref={monacoRef}
                value={code}
                onChange={(v) => { setCode(v); setActiveSnippetId(""); }}
                height="100%"
              />
              <AnimatePresence>
                {isLoading && (
                  <motion.div key="skeleton"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center rounded-b-lg bg-background/40 backdrop-blur-[1px]"
                    aria-hidden
                  >
                    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-lg">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      <span className="text-[12px] text-muted-foreground">Analyzing code…</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CollapsiblePanel>

          {/* Error / warning banners */}
          <AnimatePresence>
            {showErrorBanner && activeErrorStep && (
              <motion.div key="error-banner"
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className="mt-2 shrink-0 overflow-hidden"
              >
                <ErrorBanner errorStep={activeErrorStep} onDismiss={() => {
                  setErrorDismissed(true);
                  monacoRef.current?.clearErrorMarker();
                  monacoRef.current?.clearHighlights();
                }} />
              </motion.div>
            )}
            {apiErrorMsg && (
              <motion.div key="api-error"
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="mt-2 shrink-0 overflow-hidden"
              >
                <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                  <Zap className="size-4 shrink-0 text-amber-400" />
                  <p className="flex-1 text-[12px] text-amber-300">{apiErrorMsg}</p>
                </div>
              </motion.div>
            )}
            {/* Trace limit — shown as red error banner, same treatment as runtime errors */}
            {isTruncated && !showErrorBanner && (
              <motion.div key="truncated"
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="mt-2 shrink-0 overflow-hidden"
              >
                <div className="flex items-start gap-3 rounded-lg border border-rose-500/25 bg-rose-950/60 px-4 py-3 backdrop-blur-sm">
                  <Zap className="mt-0.5 size-4 shrink-0 text-rose-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-rose-400">Trace Limit Reached</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-rose-300/80">
                      Execution stopped after {steps.length.toLocaleString()} steps — try a smaller input or avoid unbounded loops.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            {isTimedOut && (
              <motion.div key="timeout"
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="mt-2 shrink-0 overflow-hidden"
              >
                <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2.5">
                  <Clock className="size-4 shrink-0 text-amber-400" />
                  <p className="text-[11px] text-amber-300">Execution timed out. Check for infinite loops.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Playback collapse pill */}
          {hasSteps && (
            <div className="my-1 flex shrink-0 items-center justify-center">
              <button type="button"
                aria-label={showPlayback ? "Collapse playback" : "Expand playback"}
                onClick={() => setShowPlayback((v) => !v)}
                className="flex h-5 w-14 items-center justify-center rounded-full border border-border bg-elevated text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
              >
                {showPlayback ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />}
              </button>
            </div>
          )}

          {!hasSteps && !isLoading && status && (
            <div className="mt-2 flex shrink-0 items-center justify-center rounded-lg border border-border bg-elevated py-4">
              <p className="text-[12px] text-muted-foreground">No steps generated.</p>
            </div>
          )}

          {/* Playback controls */}
          <AnimatePresence initial={false}>
            {hasSteps && showPlayback && (
              <motion.div key="playback"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="shrink-0 overflow-hidden"
              >
                <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-3">

                  {/* LINE badge + description row */}
                  <div className="flex items-center gap-2" aria-live="polite">
                    {currentStep && (
                      <span className={cn(
                        "shrink-0 rounded px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider",
                        KIND_BADGE[currentStep.kind] ?? "bg-zinc-500/15 text-zinc-400",
                      )}>
                        {currentStep.kind === "line" ? "LINE" : currentStep.kind.toUpperCase()}
                      </span>
                    )}
                    {currentStep?.line > 0 && (
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        line {currentStep.line}
                      </span>
                    )}
                    {playback.atEnd && (
                      <span className="shrink-0 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                        end of trace
                      </span>
                    )}
                    <p className="min-w-0 truncate text-[12px] text-foreground">
                      {currentStep?.description ?? "Press play or step forward to begin"}
                    </p>
                  </div>

                  {/* Transport + speed */}
                  <div className="flex items-center gap-2">
                    <PlayBtn label="Restart" onClick={playback.restart}
                      disabled={playback.isEmpty || (playback.atStart && !playback.playing)}>
                      <RotateCcw className="size-3.5" />
                    </PlayBtn>
                    <PlayBtn label="Step backward" onClick={playback.stepBackward}
                      disabled={playback.isEmpty || playback.atStart}>
                      <SkipBack className="size-3.5" />
                    </PlayBtn>
                    <PlayBtn label={playback.playing ? "Pause" : "Play"} onClick={playback.toggle}
                      disabled={playback.isEmpty} primary>
                      {playback.playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                    </PlayBtn>
                    <PlayBtn label="Step forward" onClick={playback.stepForward}
                      disabled={playback.isEmpty || playback.atEnd}>
                      <SkipForward className="size-3.5" />
                    </PlayBtn>

                    <div className="flex flex-1 items-center gap-2 pl-1">
                      <span className="shrink-0 text-[11px] text-muted-foreground">Speed</span>
                      <input type="range" aria-label="Playback speed"
                        value={playback.speed} min={1} max={10} step={1}
                        onChange={(e) => playback.setSpeed(Number(e.target.value))}
                        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                      />
                      <span className="w-6 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                        {playback.speed}x
                      </span>
                    </div>

                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                      {playback.index + 1}/{steps.length}
                    </span>
                  </div>

                  {/* Timeline scrubber */}
                  <div
                    id="python-timeline"
                    role="slider" aria-label="Execution timeline"
                    aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={playback.index + 1}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight") playback.seek(Math.min(playback.index + 1, steps.length - 1));
                      if (e.key === "ArrowLeft")  playback.seek(Math.max(playback.index - 1, 0));
                      if (e.key === "Home")        playback.seek(0);
                      if (e.key === "End")         playback.seek(steps.length - 1);
                    }}
                    className="flex h-5 items-stretch gap-px overflow-x-auto rounded-md border border-border bg-muted/40 p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {timelineSegments.map((seg, i) => (
                      <button
                        key={i} type="button"
                        aria-label={seg.from === seg.to ? `Step ${seg.from + 1}` : `Steps ${seg.from + 1}–${seg.to + 1}`}
                        onClick={() => playback.seek(Math.round((seg.from + seg.to) / 2))}
                        className={cn(
                          "min-w-0 flex-1 rounded-[2px] transition-all",
                          STEP_KIND_COLOR[seg.kind] ?? "bg-slate-500",
                          seg.active
                            ? "opacity-100 ring-2 ring-foreground ring-offset-1 ring-offset-background"
                            : "opacity-35 hover:opacity-70",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Sidebar rail ──────────────────────────────────────────────── */}
        <button type="button"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          onClick={() => setSidebarOpen((o) => !o)}
          className={cn(
            "relative z-10 my-auto flex h-12 w-4 shrink-0 items-center justify-center",
            "rounded-full border border-border bg-elevated shadow-md",
            "text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground",
          )}
        >
          {sidebarOpen ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
        </button>

        {/* ── Right sidebar ─────────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "clamp(300px, 50%, 680px)", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-3"
            >
              {/* Top slot — Memory View gets ~60 % of sidebar height */}
              <SidebarSlot
                title={getSlotTitle("memory")}
                icon={getSlotIcon("memory")}
                badge={getSlotBadge("memory")}
                className="flex-[3]"
              >
                {getSlotContent("memory")}
              </SidebarSlot>

              {/* Bottom slot — Call Stack / Console gets ~40 % */}
              <SidebarSlot
                title={getSlotTitle(bottomSlot)}
                icon={getSlotIcon(bottomSlot)}
                badge={getSlotBadge(bottomSlot)}
                canSwapTo="console"
                swapLabel={bottomSlot === "console" ? "Call Stack" : "Console"}
                onSwap={bottomSlot === "console" ? swapBottomBack : swapBottomToConsole}
                contentClassName={bottomSlot === "console" ? "bg-zinc-950" : undefined}
                className="flex-[2]"
              >
                {getSlotContent(bottomSlot)}
              </SidebarSlot>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

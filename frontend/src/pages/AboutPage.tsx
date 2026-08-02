/**
 * AboutPage — Platform overview, architecture, technology stack,
 * and algorithm catalog. Strictly reflects what is *actually* implemented.
 */

import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpDown,
  Code2,
  GitBranch,
  Grid3x3,
  Layers,
  Link2,
  MonitorPlay,
  Network,
  Play,
  Search,
  Server,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { springs, staggerDelay } from "@/lib/animation";

/* ───────────────────────────────────────────────── data ── */

const TECH_STACK = [
  {
    layer: "Frontend",
    icon: <MonitorPlay className="size-5 text-primary" />,
    items: [
      { name: "React 18", detail: "Component-based UI" },
      { name: "TypeScript", detail: "Type-safe codebase" },
      { name: "Vite", detail: "Dev server & bundler" },
      { name: "Tailwind CSS v4", detail: "OKLCH design tokens" },
      { name: "Framer Motion", detail: "Animations & layout" },
      { name: "Monaco Editor", detail: "Python code editor" },
      { name: "React Router v6", detail: "Client-side routing" },
      { name: "Lucide Icons", detail: "Icon library" },
    ],
  },
  {
    layer: "Backend",
    icon: <Server className="size-5 text-accent" />,
    items: [
      { name: "Node.js + Express", detail: "REST API gateway" },
      { name: "Python + FastAPI", detail: "Execution service" },
      { name: "AST Instrumentation", detail: "Code trace generation" },
      { name: "Docker", detail: "Sandboxed execution" },
    ],
  },
  {
    layer: "Visualization Engine",
    icon: <Layers className="size-5 text-warning" />,
    items: [
      { name: "SVG + DOM", detail: "BarsCanvas, LinkedListCanvas…" },
      { name: "Framer Motion layout", detail: "Swap & sort animations" },
      { name: "Playback state machine", detail: "Play / pause / seek / speed" },
      { name: "Step trace format", detail: "Shared frontend/backend schema" },
    ],
  },
  {
    layer: "Security",
    icon: <Shield className="size-5 text-destructive" />,
    items: [
      { name: "Docker sandbox", detail: "Isolated Python execution" },
      { name: "CPU & memory limits", detail: "Resource constraints" },
      { name: "Execution timeout", detail: "Infinite loop protection" },
      { name: "No network access", detail: "Container isolation" },
    ],
  },
];

const CATALOG_GROUPS = [
  {
    label: "Sorting",
    icon: <ArrowUpDown className="size-4" />,
    accent: "primary",
    items: ["Bubble Sort", "Quick Sort", "Merge Sort", "Selection Sort", "Insertion Sort"],
  },
  {
    label: "Arrays",
    icon: <Grid3x3 className="size-4" />,
    accent: "accent",
    items: ["Create", "Traverse", "Access / Update", "Insert (3 positions)", "Delete (3 positions)", "Reverse", "Find Min/Max"],
  },
  {
    label: "Linked Lists",
    icon: <Link2 className="size-4" />,
    accent: "warning",
    items: ["Create", "Traverse", "Search", "Insert (3 positions)", "Delete (3 positions)"],
  },
  {
    label: "Stacks & Queues",
    icon: <Layers className="size-4" />,
    accent: "primary",
    items: ["Push / Pop / Peek", "isEmpty / isFull", "Enqueue / Dequeue", "Front / Rear / Peek"],
  },
  {
    label: "Graphs",
    icon: <Network className="size-4" />,
    accent: "accent",
    items: ["Breadth-First Search (BFS)", "Depth-First Search (DFS)"],
  },
  {
    label: "Searching",
    icon: <Search className="size-4" />,
    accent: "warning",
    items: ["Linear Search", "Binary Search"],
  },
];

const PYTHON_EXAMPLES = [
  "Factorial (Recursion)",
  "Fibonacci Sequence",
  "Bubble Sort",
  "Binary Search",
  "Linked List Node Append",
  "Stack Operations",
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Pick an algorithm",
    body: "Browse the catalog and select any data structure or algorithm — from arrays to graph traversals.",
    icon: <Search className="size-5" />,
  },
  {
    step: "02",
    title: "Step through execution",
    body: "Use Play, Pause, Step Forward/Back, and Speed controls to explore every operation at your own pace.",
    icon: <Play className="size-5" />,
  },
  {
    step: "03",
    title: "Inspect live state",
    body: "Synchronized code highlighting, variable tracker, and description panel show exactly what the algorithm is thinking.",
    icon: <Layers className="size-5" />,
  },
  {
    step: "04",
    title: "Write & trace Python",
    body: "Open the Python Playground, paste any code, and watch the full execution trace unfold — call stack, variables, and console output included.",
    icon: <Terminal className="size-5" />,
  },
];

const ACCENT_BORDER: Record<string, string> = {
  primary: "border-primary/30 bg-primary/5 text-primary",
  accent: "border-accent/30 bg-accent/10 text-accent",
  warning: "border-warning/30 bg-warning/10 text-warning",
};

/* ───────────────────────────────────────────────── page ── */

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <TopNav />

      <main className="flex-1">
        {/* ── Hero ── full-width dramatic centered design ── */}
        <section className="relative overflow-hidden border-b border-border min-h-[calc(100vh-3.5rem)] flex flex-col justify-center">
          {/* subtle radial gradient veil */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent_70%)]" />

          <div className="relative max-w-5xl mx-auto px-6 py-12 w-full">
            {/* eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center mb-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[11px] font-semibold text-primary tracking-wide">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                Interactive Algorithm &amp; DSA Platform · v0.1
              </span>
            </motion.div>

            {/* headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.06 }}
              className="text-center text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.04] mb-6"
            >
              Visualize code execution{" "}
              <br className="hidden sm:block" />
              <span className="text-gradient-brand">in real time.</span>
            </motion.h1>

            {/* subline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="text-center text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-14"
            >
              AlgoViz turns abstract algorithms into step-by-step visual stories.
              Pick any operation, hit play, and watch every pointer move, comparison, and swap happen in real time.
            </motion.p>

            {/* 3-col feature highlights */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                {
                  icon: <MonitorPlay className="size-5" />,
                  color: "text-primary",
                  bg: "bg-primary/10",
                  border: "border-primary/20",
                  glow: "hover:shadow-[0_8px_32px_-8px_var(--color-primary)] hover:border-primary/40",
                  title: "DSA Visualizer",
                  body: "43+ algorithms across Sorting, Arrays, Linked Lists, Stacks, Queues, Graphs, and Searching — all animated step by step.",
                  stat: "43+ operations",
                },
                {
                  icon: <Terminal className="size-5" />,
                  color: "text-accent",
                  bg: "bg-accent/10",
                  border: "border-accent/20",
                  glow: "hover:shadow-[0_8px_32px_-8px_var(--color-accent)] hover:border-accent/40",
                  title: "Python Playground",
                  body: "Write any Python code and watch the full execution trace — call stack, local variables, and console output — live.",
                  stat: "Full trace engine",
                },
                {
                  icon: <Shield className="size-5" />,
                  color: "text-warning",
                  bg: "bg-warning/10",
                  border: "border-warning/20",
                  glow: "hover:shadow-[0_8px_32px_-8px_var(--color-warning)] hover:border-warning/40",
                  title: "Sandboxed & Safe",
                  body: "Python execution runs in a Docker container with CPU, memory, and time limits — no risk, no installs required.",
                  stat: "Docker isolated",
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.25 + i * 0.07 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className={`panel p-6 flex flex-col gap-3 cursor-default transition-shadow ${card.glow}`}
                >
                  <div className={`grid size-10 place-items-center rounded-xl ${card.bg} ${card.color}`}>
                    {card.icon}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold mb-1">{card.title}</div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">{card.body}</p>
                  </div>
                  <div className={`mt-auto inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold w-fit ${card.border} ${card.bg} ${card.color}`}>
                    {card.stat}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────── */}
        <section className="border-b border-border">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <SectionLabel index={1} text="How it works" />
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-12 max-w-xl">
              From algorithm to insight in seconds.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {HOW_IT_WORKS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: staggerDelay(i, 0.08) }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="panel p-6 flex flex-col gap-4 cursor-default transition-shadow hover:shadow-[0_8px_32px_-8px_var(--color-primary)] hover:border-primary/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                      {step.icon}
                    </div>
                    <span className="text-[18px] font-mono font-bold text-muted-foreground/20">{step.step}</span>
                  </div>
                  <h3 className="text-[15px] font-semibold tracking-tight">{step.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{step.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Algorithm Catalog ─────────────────────────────────── */}
        <section className="border-b border-border">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <SectionLabel index={2} text="Algorithm Catalog" />
            <div className="flex items-end justify-between mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight max-w-xl">
                43+ operations, all visualized.
              </h2>
              <Link
                to="/learn"
                className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 shrink-0"
              >
                Open catalog <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATALOG_GROUPS.map((group, i) => (
                <motion.div
                  key={group.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: staggerDelay(i, 0.06) }}
                  whileHover={{ y: -4, scale: 1.015 }}
                  className={`panel p-5 flex flex-col gap-3 cursor-default transition-shadow ${
                    group.accent === "primary" ? "hover:shadow-[0_8px_28px_-8px_var(--color-primary)] hover:border-primary/30" :
                    group.accent === "accent" ? "hover:shadow-[0_8px_28px_-8px_var(--color-accent)] hover:border-accent/30" :
                    "hover:shadow-[0_8px_28px_-8px_var(--color-warning)] hover:border-warning/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold ${ACCENT_BORDER[group.accent]}`}
                    >
                      {group.icon}
                      {group.label}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                        <span className="size-1 rounded-full bg-border-strong flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Python Playground callout */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 panel p-6 flex flex-col sm:flex-row sm:items-center gap-5"
            >
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <Code2 className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[15px] font-semibold">Python Playground</h3>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                    Live execution
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  Write or paste any Python code and step through the full execution trace — call stack frames, heap
                  variables, and console output — powered by a Docker-sandboxed AST instrumentation engine.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {PYTHON_EXAMPLES.map((ex) => (
                    <span
                      key={ex}
                      className="rounded border border-border bg-elevated px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                to="/python"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-border bg-elevated px-4 py-2 text-[13px] font-medium text-foreground hover:bg-muted transition-colors"
              >
                Open <ArrowRight className="size-3.5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Tech Stack ────────────────────────────────────────── */}
        <section className="border-b border-border">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <SectionLabel index={3} text="Technology Stack" />
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4 max-w-xl">
              Built on reliable, modern tools.
            </h2>
            <p className="text-sm text-muted-foreground mb-12 max-w-2xl leading-relaxed">
              The platform was deliberately built without heavy external state managers or component libraries —
              favoring direct React state, Tailwind v4 design tokens, and Framer Motion for a lean, performant
              experience.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TECH_STACK.map((layer, i) => (
                <motion.div
                  key={layer.layer}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: staggerDelay(i, 0.07) }}
                  whileHover={{ y: -4, scale: 1.015 }}
                  className="panel p-6 flex flex-col gap-4 cursor-default transition-shadow hover:shadow-[0_8px_32px_-10px_oklch(0.6_0.1_280_/_0.4)] hover:border-border-strong"
                >
                  <div className="flex items-center gap-2.5">
                    {layer.icon}
                    <h3 className="text-[15px] font-semibold">{layer.layer}</h3>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {layer.items.map((item) => (
                      <li key={item.name} className="flex items-center justify-between gap-3">
                        <span className="text-[13px] font-medium">{item.name}</span>
                        <span className="text-[11px] text-muted-foreground text-right shrink-0">{item.detail}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Architecture ──────────────────────────────────────── */}
        <section className="border-b border-border">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <SectionLabel index={4} text="Architecture" />
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-12 max-w-xl">
              Three-tier microservice design.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Frontend (React SPA)",
                  icon: <MonitorPlay className="size-5 text-primary" />,
                  color: "primary",
                  shadow: "hover:shadow-[0_8px_28px_-8px_var(--color-primary)] hover:border-primary/30",
                  points: [
                    "DSA visualizations run entirely client-side",
                    "Step state machine (play/pause/seek/speed)",
                    "Synchronized code, variable & explanation panels",
                    "Responsive dual-column + sidebar layout",
                    "Dark / Light theme via CSS custom properties",
                  ],
                },
                {
                  title: "Backend (Node / Express)",
                  icon: <Server className="size-5 text-accent" />,
                  color: "accent",
                  shadow: "hover:shadow-[0_8px_28px_-8px_var(--color-accent)] hover:border-accent/30",
                  points: [
                    "REST API gateway for Python execution requests",
                    "Forwards code to the execution service",
                    "CORS & basic rate limiting",
                  ],
                },
                {
                  title: "Execution Service (Python)",
                  icon: <Terminal className="size-5 text-warning" />,
                  color: "warning",
                  shadow: "hover:shadow-[0_8px_28px_-8px_var(--color-warning)] hover:border-warning/30",
                  points: [
                    "FastAPI HTTP service",
                    "AST instrumentation of user Python code",
                    "Runs inside a Docker container",
                    "CPU, memory & time limits enforced",
                    "Returns JSON execution trace to frontend",
                  ],
                },
              ].map((tier, i) => (
                <motion.div
                  key={tier.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: staggerDelay(i, 0.08) }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className={`panel p-6 flex flex-col gap-4 cursor-default transition-shadow ${tier.shadow}`}
                >
                  <div className="flex items-center gap-2.5">
                    {tier.icon}
                    <h3 className="text-[14px] font-semibold">{tier.title}</h3>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {tier.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                        <span className="mt-[5px] size-1 rounded-full bg-border-strong flex-shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Data flow diagram */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 panel p-6"
            >
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-5">
                Python Execution Data Flow
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[13px]">
                {(
                  [
                    { label: "User Code", highlight: false },
                    { label: "→", highlight: false },
                    { label: "Frontend", highlight: true, color: "primary" },
                    { label: "→", highlight: false },
                    { label: "Express API", highlight: true, color: "accent" },
                    { label: "→", highlight: false },
                    { label: "AST Parser", highlight: true, color: "warning" },
                    { label: "→", highlight: false },
                    { label: "Docker Sandbox", highlight: true, color: "destructive" },
                    { label: "→", highlight: false },
                    { label: "JSON Trace", highlight: true, color: "accent" },
                    { label: "→", highlight: false },
                    { label: "Step Renderer", highlight: true, color: "primary" },
                  ] as Array<{ label: string; highlight: boolean; color?: string }>
                ).map((node, i) =>
                  node.highlight ? (
                    <span
                      key={i}
                      className={`rounded border px-2.5 py-1 font-medium text-[12px] ${
                        node.color === "primary"
                          ? "border-primary/25 bg-primary/5 text-primary"
                          : node.color === "accent"
                            ? "border-accent/25 bg-accent/5 text-accent"
                            : node.color === "warning"
                              ? "border-warning/25 bg-warning/5 text-warning"
                              : "border-destructive/25 bg-destructive/5 text-destructive"
                      }`}
                    >
                      {node.label}
                    </span>
                  ) : (
                    <span key={i} className="text-muted-foreground font-mono">
                      {node.label}
                    </span>
                  ),
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Design System ─────────────────────────────────────── */}
        <section className="border-b border-border">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <SectionLabel index={5} text="Design System" />
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-12 max-w-xl">
              Premium, theme-aware, and consistent.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: "OKLCH Color Space",
                  icon: <Zap className="size-4 text-warning" />,
                  body: "All colors are defined as OKLCH tokens in Tailwind v4, enabling perceptually uniform gradients and vibrant accents that work across both light and dark themes.",
                },
                {
                  title: "Dual-Theme",
                  icon: <Layers className="size-4 text-primary" />,
                  body: "Light and dark mode are first-class citizens. Every surface, border, and text color is a semantic token that swaps cleanly at the CSS layer — no JavaScript required.",
                },
                {
                  title: "Framer Motion",
                  icon: <Play className="size-4 text-accent" />,
                  body: "Layout animations, spring physics, and staggered entry effects are shared via a central animation.ts config — keeping motion consistent and performant across every page.",
                },
                {
                  title: "Geist Typography",
                  icon: <Code2 className="size-4 text-warning" />,
                  body: "Geist Sans for UI and Geist Mono for code and variables. Tight tracking, strong hierarchy, and legible at every size.",
                },
                {
                  title: "Panel System",
                  icon: <Grid3x3 className="size-4 text-primary" />,
                  body: "Every workspace surface reuses the shared `.panel` utility — consistent background, border, radius, and shadow, with a `.panel-header` chrome pattern.",
                },
                {
                  title: "Visualization Colors",
                  icon: <GitBranch className="size-4 text-accent" />,
                  body: "Dedicated CSS tokens for every algorithm state: idle, compare-left, compare-right, active (swap), sorted, and pivot — all theme-aware.",
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: staggerDelay(i, 0.06) }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="panel p-5 flex flex-col gap-3 cursor-default transition-shadow hover:shadow-[0_8px_28px_-8px_var(--color-primary)] hover:border-primary/20"
                >
                  <div className="grid size-8 place-items-center rounded-md bg-muted">{card.icon}</div>
                  <h3 className="text-[14px] font-semibold">{card.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{card.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

/* ─────────────────────────── Section label ── */
function SectionLabel({ index, text }: { index: number; text: string }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
      {String(index).padStart(2, "0")} — {text}
    </div>
  );
}

// Needed so Framer Motion's `springs` import doesn't get tree-shaken
void springs;

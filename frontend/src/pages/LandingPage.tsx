import { Link } from "react-router-dom";
import { ArrowRight, Play, Terminal, Layers, GitGraph } from "lucide-react";
import { motion } from "motion/react";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { BubbleSortPreview } from "@/components/landing/BubbleSortPreview";
import { springs } from "@/lib/animation";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <TopNav />

      {/* Hero */}
      <section className="border-b border-border min-h-[calc(100vh-3.5rem)] flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 bg-accent rounded-full" />
              Interactive algorithm platform · v0.1
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02] mb-6"
            >
              See how <span className="text-gradient-brand">code</span> actually runs.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base text-muted-foreground max-w-xl mb-10 leading-relaxed"
            >
              A precision developer tool for learning algorithms, data structures, and Python execution.
              Step through operations, inspect memory, and understand every pointer move.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                to="/learn"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-[0_10px_28px_-14px_var(--color-primary)] transition-opacity hover:opacity-90"
              >
                Start visualizing
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/python"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg border border-border bg-elevated text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Terminal className="h-4 w-4" />
                Try Python tracer
              </Link>
            </motion.div>
          </div>

          {/* Live bubble sort preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <BubbleSortPreview />
          </motion.div>
        </div>
      </section>

      {/* Features — Products */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-4">01 — Products</div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-12 max-w-2xl">
            Two workspaces. One mental model.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <FeatureCard
              className="md:col-span-7 md:row-span-2"
              icon={<GitGraph className="h-5 w-5" />}
              label="Product 01"
              title="Interactive DSA Learning"
              body="Visualize arrays, linked lists, trees, and graphs. Step-by-step execution with pointer, comparison, and swap highlighting. Play, pause, rewind, and scrub through any algorithm."
              cta={
                <Link to="/learn" className="inline-flex items-center gap-1.5 text-sm hover:text-foreground text-muted-foreground transition-colors">
                  Explore catalog <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
              accent="primary"
            />
            <FeatureCard
              className="md:col-span-5"
              icon={<Terminal className="h-5 w-5" />}
              label="Product 02"
              title="Python Execution Visualizer"
              body="Write Python, run it, and inspect the call stack, heap objects, and every local. Replay execution history any time."
              cta={
                <Link to="/python" className="inline-flex items-center gap-1.5 text-sm hover:text-foreground text-muted-foreground transition-colors">
                  Open editor <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
              accent="accent"
            />
            <FeatureCard
              className="md:col-span-5"
              icon={<Layers className="h-5 w-5" />}
              label="Depth"
              title="Memory model"
              body="Stack frames, heap objects, and references shown as first-class citizens."
              accent="warning"
            />
          </div>
        </div>
      </section>

      {/* Ready Topics — Catalog Preview */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-4">02 — Catalog</div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Ready to visualize</h2>
            </div>
            <Link to="/learn" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
              Full catalog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border rounded-lg overflow-hidden">
            {READY_TOPICS.map((t) => (
              <Link
                key={t.slug}
                to={`/learn/${t.slug}`}
                className="bg-background p-6 hover:bg-secondary transition-colors group"
              >
                <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-4">{t.category}</div>
                <div className="text-lg font-medium tracking-tight mb-2">{t.name}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">{t.complexity}</span>
                  <Play className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ──────────────── Sub-components ──────────────── */

const ACCENT_MAP: Record<string, string> = {
  primary: "text-primary",
  accent: "text-accent",
  warning: "text-warning",
};

function FeatureCard({
  className = "",
  icon,
  label,
  title,
  body,
  cta,
  accent = "primary",
}: {
  className?: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  body: string;
  cta?: React.ReactNode;
  accent?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={springs.bouncy}
      className={`panel p-8 flex flex-col gap-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className={ACCENT_MAP[accent] || "text-primary"}>{icon}</div>
        <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</div>
      </div>
      <h3 className="text-xl sm:text-2xl font-medium tracking-tight mt-4">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{body}</p>
      {cta && <div className="pt-4">{cta}</div>}
    </motion.div>
  );
}

const READY_TOPICS = [
  { slug: "sorting/bubble-sort",    name: "Bubble Sort",       complexity: "O(n²)",     category: "Sorting" },
  { slug: "sorting/merge-sort",     name: "Merge Sort",        complexity: "O(n log n)", category: "Sorting" },
  { slug: "sorting/quick-sort",     name: "Quick Sort",        complexity: "O(n log n)", category: "Sorting" },
  { slug: "arrays/array-create",    name: "Array Operations",  complexity: "O(n)",      category: "Data Structures" },
  { slug: "linked-list/create",     name: "Linked List",       complexity: "O(n)",      category: "Data Structures" },
  { slug: "graphs/bfs",             name: "BFS",               complexity: "O(V+E)",    category: "Graph" },
  { slug: "graphs/dfs",             name: "DFS",               complexity: "O(V+E)",    category: "Graph" },
  { slug: "searching/binary-search",name: "Binary Search",     complexity: "O(log n)",  category: "Searching" },
];

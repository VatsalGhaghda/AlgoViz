import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const KEYWORDS_PATTERN =
  /\b(def|for|in|range|if|not|return|break|len|True|False|while|else|elif|and|or|class|import|from|None|self|pass|continue|lambda|yield|with|as|try|except|finally|raise|del|global|nonlocal|assert|async|await)\b|\b\d+\b/g;

function highlight(line: string) {
  const parts: { text: string; kind: string }[] = [];
  let last = 0;
  const pattern = new RegExp(KEYWORDS_PATTERN.source, "g");
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(line))) {
    if (m.index > last) parts.push({ text: line.slice(last, m.index), kind: "plain" });
    parts.push({ text: m[0], kind: /^\d+$/.test(m[0]) ? "num" : "kw" });
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push({ text: line.slice(last), kind: "plain" });
  return parts;
}

interface Props {
  code: string[];
  activeLine: number;
}

export function CodePanel({ code, activeLine }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the active line
  useEffect(() => {
    if (!scrollRef.current) return;
    const target = scrollRef.current.querySelector<HTMLElement>(`[data-line="${activeLine}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeLine]);

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto py-2">
      {code.map((line, idx) => {
        const n = idx + 1;
        const active = n === activeLine;
        return (
          <div key={n} data-line={n} className="relative flex items-start px-1">
            {active && (
              <motion.span
                layoutId="code-active-line"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className="absolute inset-y-0 left-0 right-1 rounded-sm border-l-2 border-primary bg-highlight"
              />
            )}
            <span
              className={cn(
                "relative w-8 shrink-0 select-none pr-3 text-right font-mono text-[11px] leading-6",
                active ? "text-primary-glow" : "text-muted-foreground/70",
              )}
            >
              {n}
            </span>
            <code
              className={cn(
                "relative whitespace-pre font-mono text-[12.5px] leading-6",
                active ? "text-foreground" : "text-surface-foreground",
              )}
            >
              {highlight(line).map((p, i) => (
                <span
                  key={i}
                  className={
                    p.kind === "kw"
                      ? "text-syntax-keyword"
                      : p.kind === "num"
                        ? "text-syntax-num"
                        : undefined
                  }
                >
                  {p.text}
                </span>
              ))}
            </code>
          </div>
        );
      })}
    </div>
  );
}

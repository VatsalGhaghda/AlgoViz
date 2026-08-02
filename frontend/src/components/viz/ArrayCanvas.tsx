import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Pointer, VisualizationStep, AlgorithmMeta } from "@/types/visualization";

const BOX_SIZE = 56;
const BOX_GAP = 4;

export const ARRAY_LEGEND = [
  { label: "Active", className: "bg-cyan-500" },
  { label: "Compare", className: "bg-amber-500" },
  { label: "Found / Target", className: "bg-emerald-500" },
  { label: "Error", className: "bg-rose-500" },
];

interface ArrayCanvasProps {
  step: VisualizationStep;
  meta: AlgorithmMeta;
}

export function ArrayCanvas({ step, meta }: ArrayCanvasProps) {
  const originalArrayRef = useRef<number[]>(step.data);

  if (step.data.length !== originalArrayRef.current.length) {
    originalArrayRef.current = [...step.data];
  }

  const items = useMemo(() => {
    return step.data.map((v, idx) => {
      const id = step.boxIds ? step.boxIds[idx] : String(idx);
      return { value: v, id, idx };
    });
  }, [step.data, step.boxIds]);

  const totalContentWidth = items.length * BOX_SIZE + (items.length - 1) * BOX_GAP;
  const getBoxStyle = (idx: number, id?: number | string) => {
    let fill = "transparent";
    let stroke = "rgba(255,255,255,0.2)";
    let text = "#a1a1aa"; // text-zinc-400

    const state = step?.highlights?.[idx] || "idle";
    const legendItem = ARRAY_LEGEND.find((l) => l.label.toLowerCase().includes(state));

    if (state === "error") {
      fill = "rgba(239,68,68,0.2)";
      stroke = "rgb(239,68,68)";
      text = "rgb(239,68,68)";
    } else if (legendItem) {
      if (state === "compare" || state === "key") {
        fill = "rgba(245,158,11,0.2)";
        stroke = "rgb(245,158,11)";
        text = "rgb(245,158,11)";
      } else if (state === "active" || state === "swap") {
        fill = "rgba(6,182,212,0.2)";
        stroke = "rgb(6,182,212)";
        text = "rgb(6,182,212)";
      } else if (state === "sorted" || state === "found") {
        fill = "rgba(16,185,129,0.2)";
        stroke = "rgb(16,185,129)";
        text = "rgb(16,185,129)";
      }
    }

    return { fill, stroke, text };
  };

  const hasRightShift = step?.pointers?.some(p => p.label === "i-1");
  const hasLeftShift = step?.pointers?.some(p => p.label === "i+1");
  const isShift = hasRightShift || hasLeftShift;
  const initialX = hasRightShift ? (BOX_SIZE / 2) - 74 : hasLeftShift ? (BOX_SIZE / 2) + 74 : BOX_SIZE / 2;
  const initialY = isShift ? (BOX_SIZE / 2 + 5) : (BOX_SIZE / 2 - 15);

  const startX = 40;
  const svgWidth = startX * 2 + totalContentWidth;
  const baselineY = 100;

  const activePointers = (step.pointers || []).filter(p => typeof p.index === 'number');
  const isError = step.description?.includes("not valid");

  return (
    <div className="relative flex-1 flex flex-col w-full min-h-0 bg-[#09090b] rounded-lg border border-white/5">
      {isError && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-50">
          <span className="text-[13px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-1.5 rounded shadow-lg backdrop-blur-md">
            {step.description} {step.nextHint}
          </span>
        </div>
      )}
      
      <div className="flex-1 overflow-x-auto overflow-y-hidden select-none custom-scrollbar relative flex items-center justify-center">
        <svg
          width={Math.max(svgWidth, 600)}
          height={280}
          className="mx-auto block"
          style={{ minWidth: svgWidth }}
        >
          {/* Center the array visually if there's extra space */}
          <g transform={`translate(${Math.max(0, (600 - svgWidth) / 2)}, 0)`}>
            <AnimatePresence mode="popLayout">
              {items.map((item, i) => {
                const x = startX + i * (BOX_SIZE + BOX_GAP);
                const style = getBoxStyle(item.idx);
                
                return (
                  <motion.g
                    key={item.id}
                    layoutId={`array-box-${item.id}`}
                    initial={{ opacity: 0, scale: 0.8, y: baselineY - 20 }}
                    animate={{ opacity: 1, scale: 1, x, y: baselineY }}
                    exit={{ opacity: 0, scale: 0.8, y: baselineY + 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <rect
                      width={BOX_SIZE}
                      height={BOX_SIZE}
                      rx={8}
                      fill={style.fill}
                      stroke={style.stroke}
                      strokeWidth={2}
                    />
                    <AnimatePresence>
                      <motion.text
                        key={item.value}
                        initial={{ opacity: 0, x: initialX, y: initialY }}
                        animate={{ opacity: 1, x: BOX_SIZE / 2, y: BOX_SIZE / 2 + 5 }}
                        exit={{ opacity: 0, x: BOX_SIZE / 2, y: BOX_SIZE / 2 + 20, scale: 0.8 }}
                        transition={{ duration: 0.25 }}
                        textAnchor="middle"
                        fill={style.text}
                        fontSize={16}
                        fontWeight={600}
                        fontFamily="monospace"
                      >
                        {item.value}
                      </motion.text>
                    </AnimatePresence>
                    
                    {/* Index label */}
                    <text
                      x={BOX_SIZE / 2}
                      y={BOX_SIZE + 22}
                      textAnchor="middle"
                      fill="#71717a"
                      fontSize={12}
                      fontFamily="monospace"
                    >
                      {item.idx}
                    </text>
                  </motion.g>
                );
              })}
            </AnimatePresence>

            {/* Pointers */}
            <AnimatePresence>
              {activePointers.map((p) => {
                const x = startX + (p.index as number) * (BOX_SIZE + BOX_GAP) + BOX_SIZE / 2;
                const color = p.color === 'cyan' ? '#06b6d4' : (p.color === 'amber' ? '#facc15' : (p.color === 'emerald' ? '#10b981' : (p.color === 'purple' ? '#a855f7' : '#a1a1aa')));
                
                // Offset min/max pointers down so they don't overlap with standard pointers like 'i'
                const yOff = (p.label === 'min' || p.label === 'max') ? 28 : 0;
                // Draw pointer below the index label (which is at BOX_SIZE + 22)
                const ptrY = baselineY + BOX_SIZE + 35;
                
                return (
                  <motion.g
                    key={`ptr-${p.id || p.label}`}
                    initial={{ opacity: 0, y: ptrY + 10 }}
                    animate={{ opacity: 1, x, y: ptrY }}
                    exit={{ opacity: 0, y: ptrY + 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <line
                      x1={0}
                      y1={0}
                      x2={0}
                      y2={16 + yOff}
                      stroke={color}
                      strokeWidth={2}
                    />
                    <rect
                      x={-(p.label.length * 8 + 16) / 2}
                      y={16 + yOff}
                      width={p.label.length * 8 + 16}
                      height={22}
                      rx={4}
                      fill={color}
                    />
                    <text
                      x={0}
                      y={31 + yOff}
                      textAnchor="middle"
                      fill="#000"
                      fontSize={12}
                      fontWeight={600}
                      fontFamily="monospace"
                    >
                      {p.label}
                    </text>
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </g>
        </svg>
      </div>
    </div>
  );
}

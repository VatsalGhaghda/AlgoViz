import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Pointer, VisualizationStep, AlgorithmMeta } from "@/types/visualization";
import { ARRAY_LEGEND } from "./ArrayCanvas";

const STACK_BOX_WIDTH = 110;
const STACK_BOX_HEIGHT = 42;
const STACK_BOX_GAP = 2;

const ARRAY_BOX_SIZE = 48;
const ARRAY_BOX_GAP = 2;

export const STACK_LEGEND = [
  { label: "Active", className: "bg-cyan-500" },
  { label: "Peek / Target", className: "bg-emerald-500" },
  { label: "Overflow / Underflow", className: "bg-rose-500" },
];

interface StackCanvasProps {
  step: VisualizationStep;
  meta: AlgorithmMeta;
}

export function StackCanvas({ step, meta }: StackCanvasProps) {
  const originalArrayRef = useRef<number[]>(step.data);

  if (step.data.length !== originalArrayRef.current.length) {
    originalArrayRef.current = [...step.data];
  }

  const items = useMemo(() => {
    return step.data.map((v, idx) => {
      const id = String(idx);
      return { value: v, id, idx };
    });
  }, [step.data]);

  const capacity = typeof step.vars?.capacity?.value === 'number' ? step.vars.capacity.value : 5;
  const isArrCreated = step.vars?.arr?.value !== "None";

  const arrayItems = useMemo(() => {
    return Array.from({ length: capacity }).map((_, idx) => {
      if (idx < items.length) {
        return items[idx];
      }
      return { value: "None", id: String(idx), idx };
    });
  }, [items, capacity]);

  const getBoxStyle = (idx: number) => {
    let fill = "transparent";
    let stroke = "rgba(255,255,255,0.2)";
    let text = "#a1a1aa"; 

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

  const svgHeight = Math.max(340, capacity * (STACK_BOX_HEIGHT + STACK_BOX_GAP) + 140);
  const baselineY = svgHeight - 130;
  
  const stackStartX = 180;
  const arrayStartX = 380;

  const activePointers = (step.pointers || []).filter(p => typeof p.index === 'number');
  const isError = step.description?.includes("not valid") || step.description?.includes("Underflow") || step.description?.includes("Overflow");

  return (
    <div className="relative flex-1 flex flex-col w-full min-h-0 bg-[#09090b] rounded-lg border border-white/5">
      {isError && (
        <div className="absolute top-8 left-[60%] -translate-x-1/2 flex flex-col items-center gap-1 z-50">
          <span className="text-[13px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-1.5 rounded shadow-lg backdrop-blur-md">
            {step.description} {step.nextHint}
          </span>
        </div>
      )}
      
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar relative flex items-end justify-center">
        <svg
          width={850}
          height={svgHeight}
          className="block mx-auto min-w-[850px]"
        >
          <g>
            {/* 1. RENDER VERTICAL STACK */}
            {isArrCreated && (
              <>
                <text x={stackStartX - 40} y={baselineY - (capacity / 2) * (STACK_BOX_HEIGHT + STACK_BOX_GAP) + STACK_BOX_HEIGHT / 2} textAnchor="end" fill="#52525b" fontSize="14" fontWeight={600} fontFamily="monospace" letterSpacing={1}>
                  LOGICAL STACK
                </text>
                
                {/* Dashed logical stack boxes */}
                {arrayItems.map((_, i) => {
                  const y = baselineY - i * (STACK_BOX_HEIGHT + STACK_BOX_GAP);
                  return (
                    <g key={`stack-empty-${i}`}>
                      <rect
                        x={stackStartX}
                        y={y}
                        width={STACK_BOX_WIDTH}
                        height={STACK_BOX_HEIGHT}
                        rx={6}
                        fill="transparent"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                      />
                      <text x={stackStartX - 15} y={y + STACK_BOX_HEIGHT / 2 + 4} textAnchor="end" fill="#3f3f46" fontSize="12" fontFamily="monospace">
                        {i}
                      </text>
                    </g>
                  );
                })}

                <AnimatePresence mode="popLayout">
                  {items.filter(item => String(item.value) !== "None").map((item) => {
                    const y = baselineY - item.idx * (STACK_BOX_HEIGHT + STACK_BOX_GAP);
                    const style = getBoxStyle(item.idx);
                    
                    return (
                      <motion.g
                        key={item.id}
                        layoutId={`logical-box-${item.id}`}
                        initial={{ opacity: 0, scale: 0.8, y: y - 40 }}
                        animate={{ opacity: 1, scale: 1, x: stackStartX, y }}
                        exit={{ opacity: 0, scale: 0.8, y: y - 40 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <rect
                          width={STACK_BOX_WIDTH}
                          height={STACK_BOX_HEIGHT}
                          rx={6}
                          fill={style.fill}
                          stroke={style.stroke}
                          strokeWidth={2}
                        />
                        <motion.text
                          animate={{ opacity: 1, x: STACK_BOX_WIDTH / 2, y: STACK_BOX_HEIGHT / 2 + 5 }}
                          textAnchor="middle"
                          fill={style.text}
                          fontSize={16}
                          fontWeight={600}
                          fontFamily="monospace"
                        >
                          {item.value}
                        </motion.text>
                      </motion.g>
                    );
                  })}
                </AnimatePresence>

                {/* Vertical Stack Pointers */}
                <AnimatePresence>
                  {activePointers.map((p) => {
                    const y = baselineY - (p.index as number) * (STACK_BOX_HEIGHT + STACK_BOX_GAP) + STACK_BOX_HEIGHT / 2;
                    const color = p.color === 'cyan' ? '#06b6d4' : (p.color === 'amber' ? '#facc15' : (p.color === 'emerald' ? '#10b981' : (p.color === 'purple' ? '#a855f7' : '#a1a1aa')));
                    const ptrX = stackStartX + STACK_BOX_WIDTH + 20;
                    
                    return (
                      <motion.g
                        key={`stack-ptr-${p.id || p.label}`}
                        initial={{ opacity: 0, x: ptrX + 20 }}
                        animate={{ opacity: 1, x: ptrX, y }}
                        exit={{ opacity: 0, x: ptrX + 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <line x1={0} y1={0} x2={16} y2={0} stroke={color} strokeWidth={2} />
                        <rect x={16} y={-11} width={p.label.length * 8 + 16} height={22} rx={4} fill={color} />
                        <text x={16 + (p.label.length * 8 + 16) / 2} y={4} textAnchor="middle" fill="#000" fontSize={12} fontWeight={600} fontFamily="monospace">
                          {p.label}
                        </text>
                      </motion.g>
                    );
                  })}
                </AnimatePresence>
              </>
            )}

            {/* 2. RENDER HORIZONTAL ARRAY */}
            {isArrCreated && (
              <>
                <text x={arrayStartX + (capacity * (ARRAY_BOX_SIZE + ARRAY_BOX_GAP)) + 20} y={baselineY + STACK_BOX_HEIGHT - ARRAY_BOX_SIZE / 2 + 5} textAnchor="start" fill="#52525b" fontSize="14" fontWeight={600} fontFamily="monospace" letterSpacing={1}>
                  PHYSICAL ARRAY
                </text>

                {/* Draw empty placeholder slots for horizontal array */}
                {arrayItems.map((_, i) => {
                  const x = arrayStartX + i * (ARRAY_BOX_SIZE + ARRAY_BOX_GAP);
                  return (
                    <g key={`empty-slot-${i}`}>
                      <rect
                        x={x}
                        y={baselineY - ARRAY_BOX_SIZE + STACK_BOX_HEIGHT} // Align bottom with vertical stack's baseline
                        width={ARRAY_BOX_SIZE}
                        height={ARRAY_BOX_SIZE}
                        rx={8}
                        fill="transparent"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                      />
                      <text x={x + ARRAY_BOX_SIZE / 2} y={baselineY + STACK_BOX_HEIGHT + 20} textAnchor="middle" fill="#3f3f46" fontSize="12" fontFamily="monospace">
                        {i}
                      </text>
                    </g>
                  );
                })}

                <AnimatePresence mode="popLayout">
                  {arrayItems.map((item, i) => {
                    const x = arrayStartX + i * (ARRAY_BOX_SIZE + ARRAY_BOX_GAP);
                    const y = baselineY - STACK_BOX_HEIGHT + STACK_BOX_HEIGHT; // Or align appropriately
                    const style = getBoxStyle(item.idx);

                    return (
                      <motion.g
                        key={`physical-${item.id}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, x, y: baselineY - ARRAY_BOX_SIZE + STACK_BOX_HEIGHT }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <rect
                          width={ARRAY_BOX_SIZE}
                          height={ARRAY_BOX_SIZE}
                          rx={8}
                          fill={style.fill}
                          stroke={style.stroke}
                          strokeWidth={2}
                        />
                        <text
                          x={ARRAY_BOX_SIZE / 2}
                          y={ARRAY_BOX_SIZE / 2 + 5}
                          textAnchor="middle"
                          fill={style.text}
                          fontSize={16}
                          fontWeight={600}
                          fontFamily="monospace"
                        >
                          {item.value}
                        </text>
                      </motion.g>
                    );
                  })}
                </AnimatePresence>

                {/* Horizontal Array Pointers */}
                <AnimatePresence>
                  {activePointers.map((p) => {
                    const x = arrayStartX + (p.index as number) * (ARRAY_BOX_SIZE + ARRAY_BOX_GAP) + ARRAY_BOX_SIZE / 2;
                    const color = p.color === 'cyan' ? '#06b6d4' : (p.color === 'amber' ? '#facc15' : (p.color === 'emerald' ? '#10b981' : (p.color === 'purple' ? '#a855f7' : '#a1a1aa')));
                    
                    const ptrY = baselineY + STACK_BOX_HEIGHT + 30; // moved up slightly so it fits in svg
                    
                    return (
                      <motion.g
                        key={`array-ptr-${p.id || p.label}`}
                        initial={{ opacity: 0, y: ptrY + 10 }}
                        animate={{ opacity: 1, x, y: ptrY }}
                        exit={{ opacity: 0, y: ptrY + 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <line x1={0} y1={0} x2={0} y2={16} stroke={color} strokeWidth={2} />
                        <rect x={-(p.label.length * 8 + 16) / 2} y={16} width={p.label.length * 8 + 16} height={22} rx={4} fill={color} />
                        <text x={0} y={31} textAnchor="middle" fill="#000" fontSize={12} fontWeight={600} fontFamily="monospace">
                          {p.label}
                        </text>
                      </motion.g>
                    );
                  })}
                </AnimatePresence>
              </>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}

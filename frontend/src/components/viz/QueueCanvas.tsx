import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useRef } from "react";
import type { VisualizationStep, AlgorithmMeta } from "@/types/visualization";

const QUEUE_BOX_SIZE = 56;
const QUEUE_BOX_GAP = 0; // Seamless pipe

const ARRAY_BOX_SIZE = 48;
const ARRAY_BOX_GAP = 2;

export const QUEUE_LEGEND = [
  { label: "Active", className: "bg-cyan-500" },
  { label: "Peek / Target", className: "bg-emerald-500" },
  { label: "Overflow / Underflow", className: "bg-rose-500" },
];

interface QueueCanvasProps {
  step: VisualizationStep;
  meta: AlgorithmMeta;
}

export function QueueCanvas({ step, meta }: QueueCanvasProps) {
  void meta; // Unused but required by props
  const originalArrayRef = useRef<number[]>(step.data);

  if (step.data.length !== originalArrayRef.current.length) {
    originalArrayRef.current = [...step.data];
  }

  const items = useMemo(() => {
    return step.data.map((v, idx) => {
      return { value: v, id: String(idx), idx };
    });
  }, [step.data]);

  const capacity = typeof step.vars?.capacity?.value === 'number' ? step.vars.capacity.value : 5;
  const isArrCreated = step.vars?.arr?.value !== "None";
  const frontValue = typeof step.vars?.front?.value === 'number' ? step.vars.front.value : -1;
  void (typeof step.vars?.rear?.value === 'number' ? step.vars.rear.value : -1);
  
  const activeElements = items.filter(item => {
    if (frontValue === -1) return false;
    return item.idx >= frontValue;
  });

  const arrayItems = useMemo(() => {
    return Array.from({ length: capacity }).map((_, idx) => {
      if (idx < items.length) {
        return items[idx];
      }
      return null;
    });
  }, [items, capacity]);

  const getBoxStyle = (idx: number) => {
    let fill = "transparent";
    let stroke = "rgba(255,255,255,0.2)";
    let text = "#a1a1aa"; 

    const state = step?.highlights?.[idx] || "idle";
    void (QUEUE_LEGEND.find((l) => l.label.toLowerCase().includes(state)));

    if (state === "error") {
      fill = "rgba(239,68,68,0.2)";
      stroke = "rgb(239,68,68)";
      text = "rgb(239,68,68)";
    } else if (state === "active") {
      fill = "rgba(6,182,212,0.2)";
      stroke = "rgb(6,182,212)";
      text = "rgb(6,182,212)";
    } else if (state === "found") {
      fill = "rgba(16,185,129,0.2)";
      stroke = "rgb(16,185,129)";
      text = "rgb(16,185,129)";
    }

    return { fill, stroke, text };
  };

  const svgWidth = Math.max(600, capacity * (QUEUE_BOX_SIZE + QUEUE_BOX_GAP) + 140);
  
  const logicalQueueY = 130;
  const physicalArrayY = 290;

  const queueStartX = (svgWidth - (capacity * (QUEUE_BOX_SIZE + QUEUE_BOX_GAP))) / 2 + 40;

  const activePointers = (step.pointers || []).filter(p => typeof p.index === 'number');
  const isError = step.description?.includes("Underflow") || step.description?.includes("Overflow");

  return (
    <div className="relative flex-1 flex flex-col w-full min-h-0 bg-[#09090b] rounded-lg border border-white/5">
      {isError && (
        <div className="absolute top-8 left-[50%] -translate-x-1/2 flex flex-col items-center gap-1 z-50">
          <span className="text-[13px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-1.5 rounded shadow-lg backdrop-blur-md">
            {step.description} {step.nextHint}
          </span>
        </div>
      )}
      
      <div className="flex-1 overflow-x-auto overflow-y-auto select-none custom-scrollbar">
        <svg
          width={svgWidth}
          height={380}
          className="mx-auto block"
        >
          {/* Logical Queue View */}
          {isArrCreated && (
            <g>
              <text x={queueStartX - 30} y={logicalQueueY + QUEUE_BOX_SIZE / 2 + 4} textAnchor="end" fill="#52525b" fontSize="14" fontWeight={600} fontFamily="monospace" letterSpacing={1}>
                LOGICAL QUEUE
              </text>

            {/* Dashed logical pipe background */}
            {isArrCreated && arrayItems.map((_, i) => {
              const x = queueStartX + i * (QUEUE_BOX_SIZE + QUEUE_BOX_GAP);
              return (
                <g key={`logical-empty-${i}`}>
                  <path
                    d={`M ${x} ${logicalQueueY} L ${x + QUEUE_BOX_SIZE} ${logicalQueueY} M ${x} ${logicalQueueY + QUEUE_BOX_SIZE} L ${x + QUEUE_BOX_SIZE} ${logicalQueueY + QUEUE_BOX_SIZE}`}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="transparent"
                  />
                </g>
              );
            })}

            <AnimatePresence mode="popLayout">
              {activeElements.map((item) => {
                const x = queueStartX + item.idx * (QUEUE_BOX_SIZE + QUEUE_BOX_GAP);
                const style = getBoxStyle(item.idx);
                
                return (
                  <motion.g
                    key={item.id}
                    layoutId={`logical-box-${item.id}`}
                    initial={{ opacity: 0, scale: 0.8, x: x + 40 }}
                    animate={{ opacity: 1, scale: 1, y: logicalQueueY, x }}
                    exit={{ opacity: 0, scale: 0.8, x: x - 40 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <rect
                      width={QUEUE_BOX_SIZE}
                      height={QUEUE_BOX_SIZE}
                      fill={style.fill}
                    />
                    <path
                      d={`M 0 0 L ${QUEUE_BOX_SIZE} 0 M 0 ${QUEUE_BOX_SIZE} L ${QUEUE_BOX_SIZE} ${QUEUE_BOX_SIZE}`}
                      stroke={style.stroke}
                      strokeWidth={2}
                      fill="transparent"
                    />
                    <motion.text
                      animate={{ opacity: 1, x: QUEUE_BOX_SIZE / 2, y: QUEUE_BOX_SIZE / 2 + 5 }}
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

            {/* Logical Pointers (Front / Rear) */}
            <AnimatePresence>
              {[...activePointers].sort((a) => (a.label.toLowerCase() === 'front' ? -1 : 1)).map((p) => {
                const x = queueStartX + (p.index as number) * (QUEUE_BOX_SIZE + QUEUE_BOX_GAP) + QUEUE_BOX_SIZE / 2;
                const color = p.color === 'cyan' ? '#06b6d4' : (p.color === 'amber' ? '#facc15' : (p.color === 'emerald' ? '#10b981' : (p.color === 'purple' ? '#a855f7' : '#a1a1aa')));
                
                const isFront = p.label.toLowerCase() === 'front';
                const ptrY = logicalQueueY - (isFront ? 60 : 30);
                const lineY2 = isFront ? 58 : 28;
                
                return (
                  <motion.g
                    key={`logical-ptr-${p.id || p.label}`}
                    initial={{ opacity: 0, y: ptrY - 10 }}
                    animate={{ opacity: 1, x, y: ptrY }}
                    exit={{ opacity: 0, y: ptrY - 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <line x1={0} y1={22} x2={0} y2={lineY2} stroke={color} strokeWidth={2} />
                    <rect x={-(p.label.length * 8 + 16) / 2} y={0} width={p.label.length * 8 + 16} height={22} rx={4} fill={color} />
                    <text x={0} y={15} textAnchor="middle" fill="#000" fontSize={12} fontWeight={600} fontFamily="monospace">
                      {p.label}
                    </text>
                  </motion.g>
                );
              })}
            </AnimatePresence>
          </g>
          )}

          {/* Physical Array View */}
          {isArrCreated && (
            <g>
              <text x={queueStartX - 30} y={physicalArrayY + ARRAY_BOX_SIZE / 2 + 4} textAnchor="end" fill="#52525b" fontSize="14" fontWeight={600} fontFamily="monospace" letterSpacing={1}>
                PHYSICAL ARRAY
              </text>

            {isArrCreated && (
              <>
                {Array.from({ length: capacity }).map((_, i) => (
                  <g key={`array-slot-${i}`}>
                    <rect
                      x={queueStartX + i * (ARRAY_BOX_SIZE + ARRAY_BOX_GAP)}
                      y={physicalArrayY}
                      width={ARRAY_BOX_SIZE}
                      height={ARRAY_BOX_SIZE}
                      rx={8}
                      fill="transparent"
                      stroke="#27272a"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                    <text
                      x={queueStartX + i * (ARRAY_BOX_SIZE + ARRAY_BOX_GAP) + ARRAY_BOX_SIZE / 2}
                      y={physicalArrayY + ARRAY_BOX_SIZE + 20}
                      textAnchor="middle"
                      fill="#52525b"
                      fontSize={11}
                      fontFamily="monospace"
                    >
                      {i}
                    </text>
                  </g>
                ))}

                <AnimatePresence>
                  {arrayItems.map((item, i) => {
                    if (!item) return null;
                    const x = queueStartX + i * (ARRAY_BOX_SIZE + ARRAY_BOX_GAP);
                    const style = getBoxStyle(i);
                    return (
                      <motion.g
                        key={`physical-${item.id}`}
                        initial={{ opacity: 0, scale: 0.8, x: x + 20 }}
                        animate={{ opacity: 1, scale: 1, x, y: physicalArrayY }}
                        exit={{ opacity: 0, scale: 0.8, y: physicalArrayY + 20 }}
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
                          y={ARRAY_BOX_SIZE / 2 + 4}
                          textAnchor="middle"
                          fill={style.text}
                          fontSize={14}
                          fontWeight={600}
                          fontFamily="monospace"
                          >
                            {item.value}
                          </text>
                      </motion.g>
                    );
                  })}
                </AnimatePresence>
              </>
            )}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

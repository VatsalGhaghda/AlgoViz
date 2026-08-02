import { motion, AnimatePresence } from "motion/react";
import { useMemo, useRef } from "react";
import type { Pointer, VisualizationStep } from "@/types/visualization";

const BAR_WIDTH = 56;
const BAR_GAP = 24;
const MAX_BAR_HEIGHT = 100;
const MIN_BAR_HEIGHT = 24;
const CANVAS_HEIGHT = 340;

export const BARS_LEGEND = [
  { label: "Comparing", className: "bg-viz-compare-left" },
  { label: "Swapping", className: "bg-viz-active" },
  { label: "Sorted", className: "bg-viz-sorted" },
  { label: "Unsorted", className: "bg-viz-idle" },
];

export const SEARCH_LEGEND = [
  { label: "Comparing", className: "bg-viz-compare-left" },
  { label: "Found", className: "bg-viz-sorted" },
];
const COLOR_BAR_FILL = '#1b1b1f';
const COLOR_BAR_STROKE = 'rgba(161,161,170,0.32)';
const COLOR_CYAN = '#00ceff';
const COLOR_AMBER = '#facc15';
const COLOR_GREEN = '#00d084';
const COLOR_PURPLE = '#a855f7';

interface Props {
  step: VisualizationStep;
}

export function BarsCanvas({ step }: Props) {
  const originalArrayRef = useRef<number[]>(step.data);

  if (step.data.length !== originalArrayRef.current.length) {
    originalArrayRef.current = [...step.data];
  }

  const originalArray = originalArrayRef.current;

  const items = useMemo(() => {
    const currentCounts: Record<number, number> = {};
    return step.data.map((v, idx) => {
      currentCounts[v] = (currentCounts[v] || 0) + 1;
      const id = `${v}-${currentCounts[v]}`;
      return { value: v, id, idx };
    });
  }, [step.data]);

  const maxValue = Math.max(...originalArray, 1);
  const currentMaxBarHeight = step.depth !== undefined ? 70 : MAX_BAR_HEIGHT;
  const getBarHeight = (val: number) => MIN_BAR_HEIGHT + (val / maxValue) * (currentMaxBarHeight - MIN_BAR_HEIGHT);

  const totalContentWidth = items.length * BAR_WIDTH + (items.length - 1) * BAR_GAP;

  const pointersByIndex = useMemo(() => {
    const map = new Map<number, Pointer[]>();
    for (const p of step.pointers ?? []) {
      const list = map.get(p.index) ?? [];
      list.push(p);
      map.set(p.index, list);
    }
    return map;
  }, [step.pointers]);

  const getBarState = (index: number): string => {
    const baseState = step.highlights[index] ?? "idle";
    if (baseState === "inactive") return "inactive";
    if (baseState === "hidden") return "hidden";
    if (baseState === "key") return "key";
    if (baseState === "pivot") return "pivot";
    if (baseState === "compare" || baseState === "swap") {
      const pointers = pointersByIndex.get(index);
      if (pointers?.some(p => p.color === "cyan" || p.label === "j" || p.label === "i")) {
        return "cyan";
      }
      if (pointers?.some(p => p.color === "amber" || p.label === "j+1" || p.label === "j + 1")) {
        return "amber";
      }
      return "cyan";
    }
    if (baseState === "sorted" || baseState === "found") return "green";
    return "default";
  };

  const strokeFor = (state: string) => {
    if (state === 'cyan') return COLOR_CYAN;
    if (state === 'amber' || state === 'key') return COLOR_AMBER;
    if (state === 'pivot') return COLOR_PURPLE;
    if (state === 'green') return COLOR_GREEN;
    return COLOR_BAR_STROKE;
  };

  const startX = 40;
  const baselineY = step.depth !== undefined ? 160 : 190;
  const barX = (idx: number) => startX + idx * (BAR_WIDTH + BAR_GAP);
  const svgWidth = startX * 2 + totalContentWidth;

  const springTransition = {
    type: 'spring' as const,
    stiffness: 240,
    damping: 26,
    mass: 0.9,
  };

  const activePointers = step.pointers || [];

  return (
    <div className="relative flex-1 flex flex-col w-full min-h-0">
      <AnimatePresence>
        {step.pass !== undefined && step.pass > 0 && (
          <motion.div
            key={`pass-${step.pass}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-2 left-4 text-sm font-mono text-gray-400 select-none z-10"
          >
            pass = <span style={{ color: COLOR_CYAN }} className="font-semibold">{step.pass}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex items-center justify-center overflow-visible">
        <svg
          width="100%"
          viewBox={`0 0 ${svgWidth} ${CANVAS_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ maxWidth: svgWidth, overflow: 'visible' }}
        >
          <defs>
            <filter id="bs-shadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
            </filter>
            <filter id="bs-glow-cyan" filterUnits="userSpaceOnUse" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feFlood floodColor={COLOR_CYAN} floodOpacity="0.85" result="cc" />
              <feComposite in="cc" in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="bs-glow-amber" filterUnits="userSpaceOnUse" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feFlood floodColor={COLOR_AMBER} floodOpacity="0.85" result="cc" />
              <feComposite in="cc" in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="bs-glow-green" filterUnits="userSpaceOnUse" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feFlood floodColor={COLOR_GREEN} floodOpacity="0.85" result="cc" />
              <feComposite in="cc" in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="bs-glow-purple" filterUnits="userSpaceOnUse" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feFlood floodColor={COLOR_PURPLE} floodOpacity="0.85" result="cc" />
              <feComposite in="cc" in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <AnimatePresence>
            {step.tempLine && (
              <motion.g
                key="temp-line"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <text x={Math.max(0, barX(step.tempLine.start) - 42)} y={304} fill="#71717a" fontSize="13" fontFamily="monospace">
                  temp
                </text>
                <line
                  x1={barX(step.tempLine.start) - 6}
                  x2={barX(step.tempLine.end) + BAR_WIDTH}
                  y1={300}
                  y2={300}
                  stroke="#52525b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </motion.g>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {items.map((item, idx) => {
              const tempItem = step.tempData?.find(t => t.originalIndex === idx);
              const state = tempItem ? 'cyan' : getBarState(idx);
              const stroke = strokeFor(state);
              const isUplifted = (!tempItem) && (state === 'key' || (state === 'pivot' && step.vars?.min_idx === undefined));
              const height = tempItem ? getBarHeight(item.value) * 0.6 : getBarHeight(item.value);
              const targetX = tempItem ? barX(tempItem.index) + 6 : barX(idx);
              const y = tempItem ? 300 - height : baselineY - height - (isUplifted ? 60 : 0);
              const filter =
                state === 'cyan'
                  ? 'url(#bs-glow-cyan)'
                  : state === 'amber' || state === 'key'
                    ? 'url(#bs-glow-amber)'
                    : state === 'pivot'
                      ? 'url(#bs-glow-purple)'
                      : state === 'green'
                        ? 'url(#bs-glow-green)'
                        : 'url(#bs-shadow)';

              return (
                <motion.g
                  key={item.id}
                  initial={false}
                  animate={{ x: targetX, opacity: state === 'hidden' ? 0 : (state === 'inactive' ? 0.3 : 1) }}
                  transition={springTransition}
                >
                  <motion.text
                    initial={false}
                    animate={{ y: y - (tempItem ? 8 : 12) }}
                    transition={springTransition}
                    x={BAR_WIDTH / 2}
                    textAnchor="middle"
                    fill={state === 'pivot' ? COLOR_PURPLE : (state === 'key' ? COLOR_AMBER : (tempItem ? COLOR_CYAN : "#ffffff"))}
                    fontSize={tempItem ? "13" : "16"}
                    fontWeight="600"
                    fontFamily="ui-sans-serif, system-ui"
                  >
                    {item.value}
                  </motion.text>

                  <motion.rect
                    initial={false}
                    animate={{ y, height }}
                    transition={springTransition}
                    x={0}
                    width={BAR_WIDTH}
                    rx={tempItem ? 6 : 8}
                    ry={tempItem ? 6 : 8}
                    fill={state === 'green' ? COLOR_GREEN : COLOR_BAR_FILL}
                    stroke={stroke}
                    strokeWidth={tempItem ? 2 : 2.5}
                    filter={filter}
                  />

                  <text
                    x={BAR_WIDTH / 2}
                    y={tempItem ? 326 : baselineY + 20}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize={tempItem ? "12" : "13"}
                    fontFamily="ui-sans-serif, system-ui"
                  >
                    {tempItem ? tempItem.index : idx}
                  </text>
                </motion.g>
              );
            })}
          </AnimatePresence>


          <AnimatePresence>
            {step.runs?.map((run, i) => {
              const startX = barX(run.start);
              const endX = barX(run.end) + BAR_WIDTH;
              return (
                <motion.line
                  key={`run-${i}-${run.start}-${run.end}`}
                  x1={startX}
                  x2={endX}
                  y1={baselineY + 28}
                  y2={baselineY + 28}
                  stroke={run.color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}
          </AnimatePresence>



          {step.depth !== undefined && (
            <text x="24" y="32" fill="#a1a1aa" fontSize="14" fontFamily="monospace" fontWeight="500">
              depth = <tspan fill="#22d3ee" fontWeight="700">{step.depth}</tspan>
            </text>
          )}

          <AnimatePresence mode="wait">
            {activePointers.length > 0 && (
              <motion.g
                key={step.pass !== undefined ? `pointers-pass-${step.pass}` : "pointers-container"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.25 }}
              >
                {[...activePointers].sort((a, b) => (b.label === 'min' ? 1 : 0) - (a.label === 'min' ? 1 : 0)).map((p) => {
                  const color = p.color === 'cyan' ? COLOR_CYAN : (p.color === 'amber' ? COLOR_AMBER : (p.color === 'purple' ? '#a855f7' : COLOR_BAR_STROKE));
                  const yOff = p.label === 'min' ? 28 : 0;
                  
                  return (
                    <motion.g
                      key={`ptr-${p.label}`}
                      initial={false}
                      animate={{ x: barX(p.index) }}
                      transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    >
                      <line x1={BAR_WIDTH / 2} y1={baselineY + 28} x2={BAR_WIDTH / 2} y2={baselineY + 44 + yOff} stroke={color} strokeWidth={1.5} />
                      <rect x={BAR_WIDTH / 2 - (p.label.length * 4 + 12)} y={baselineY + 44 + yOff} width={p.label.length * 8 + 24} height={22} rx={5} fill={color} />
                      <text x={BAR_WIDTH / 2} y={baselineY + 59 + yOff} textAnchor="middle" fill="#0a0a0a" fontSize="13" fontWeight="700" fontFamily="ui-monospace, monospace">
                        {p.label}
                      </text>
                    </motion.g>
                  );
                })}
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>
    </div>
  );
}

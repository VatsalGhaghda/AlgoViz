import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { VisualizationStep, AlgorithmMeta } from "@/types/visualization";

interface GraphCanvasProps {
  step: VisualizationStep;
  meta: AlgorithmMeta;
}

const COLOR_IDLE = "#1e3a8a"; // Dark blue
const COLOR_IDLE_BORDER = "#3b82f6"; // Bright blue

const COLOR_GREEN = "#10b981";
const COLOR_AMBER = "#f59e0b";
const COLOR_CYAN = "#06b6d4";

const NODE_RADIUS = 18;

// Hardcoded node positions for the default 6-node graph to perfectly match AlgoMaster
const NODE_POSITIONS = [
  { x: 150, y: 155 }, // 0
  { x: 275, y: 105 }, // 1
  { x: 275, y: 205 }, // 2
  { x: 400, y: 105 }, // 3
  { x: 400, y: 205 }, // 4
  { x: 525, y: 155 }, // 5
];

export const GRAPH_LEGEND = [
  { label: "Unvisited", className: "bg-blue-600" },
  { label: "Queued", className: "bg-amber-500" },
  { label: "Current", className: "bg-cyan-500" },
  { label: "Visited", className: "bg-emerald-500" },
];

export function GraphCanvas({ step, meta }: GraphCanvasProps) {
  const graph = meta.graph || [];
  
  const getNodeStyle = (index: number) => {
    const state = step.highlights[index] || "idle";
    
    if (state === "current") return { fill: "#083344", stroke: COLOR_CYAN, glow: COLOR_CYAN };
    if (state === "visited") return { fill: "#064e3b", stroke: COLOR_GREEN, glow: COLOR_GREEN };
    if (state === "key") return { fill: "#451a03", stroke: COLOR_AMBER, glow: COLOR_AMBER };
    
    // idle / unvisited
    return { fill: COLOR_IDLE, stroke: COLOR_IDLE_BORDER, glow: "transparent" };
  };

  const treeEdges = Array.isArray(step.vars?.treeEdges?.value) ? step.vars.treeEdges.value : [];
  const dashedEdges = Array.isArray(step.vars?.dashedEdges?.value) ? step.vars.dashedEdges.value : [];
  const currentEdge = step.vars?.currentEdge?.value as string | undefined;

  const getEdgeStyle = (u: number, v: number) => {
    const edgeId = `${u}-${v}`;
    const isCurrent = currentEdge === edgeId;
    const isTree = treeEdges.includes(edgeId);
    const isDashed = dashedEdges.includes(edgeId);

    if (isCurrent) return { color: COLOR_AMBER, dash: "none" };
    if (isTree) return { color: COLOR_GREEN, dash: "none" };
    if (isDashed) return { color: "#52525b", dash: "5 5" };
    
    // Default unvisited edge
    return { color: "#52525b", dash: "none" };
  };

  // Trajectory boxes (Order)
  const orderArray = step.trajectory || [];

  // Queue/Stack visualizer array
  const queue = Array.isArray(step.vars?.queue?.value) ? step.vars.queue.value : [];
  const stack = Array.isArray(step.vars?.stack?.value) ? step.vars.stack.value : [];
  const isDFS = meta.id === "dfs";
  const isBFS = meta.id === "bfs";

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#09090b] rounded-lg border border-white/5">
      
      {/* SVG Canvas for Graph */}
      <div className="flex-1 relative min-h-0 w-full overflow-hidden">
        
        {/* Order / Result Trajectory Tracker */}
        <div className="absolute top-6 left-0 right-0 flex items-center justify-center gap-2">
          <span className="text-[11px] text-muted-foreground mr-2 font-mono">order</span>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
              const node = orderArray[slotIdx];
              const filled = node !== undefined;
              return (
                <div
                  key={slotIdx}
                  className={cn(
                    "flex size-7 items-center justify-center rounded border border-dashed font-mono text-sm transition-all duration-300",
                    filled ? "border-emerald-500 bg-[#064e3b] text-emerald-100 border-solid" : "border-zinc-700 bg-transparent text-transparent"
                  )}
                >
                  {filled ? node : ""}
                </div>
              );
            })}
          </div>
        </div>

        <svg className="h-full w-full" preserveAspectRatio="xMidYMid meet" viewBox="0 0 650 350">
          <defs>
            {/* Arrowhead marker for default edges */}
            <marker id="arrow-default" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#52525b" />
            </marker>
            {/* Arrowhead marker for active/green edges */}
            <marker id="arrow-active" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLOR_GREEN} />
            </marker>
            {/* Arrowhead marker for queued edges */}
            <marker id="arrow-queued" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={COLOR_AMBER} />
            </marker>
          </defs>

          {/* Edges */}
          {graph.map((neighbors, u) => {
            const posU = NODE_POSITIONS[u];
            if (!posU) return null;
            
            return neighbors.map(v => {
              const posV = NODE_POSITIONS[v];
              if (!posV) return null;
              
              const style = getEdgeStyle(u, v);
              const markerEnd = style.color === COLOR_GREEN ? "url(#arrow-active)" : style.color === COLOR_AMBER ? "url(#arrow-queued)" : "url(#arrow-default)";

              return (
                <motion.line
                  key={`edge-${u}-${v}`}
                  x1={posU.x}
                  y1={posU.y}
                  x2={posV.x}
                  y2={posV.y}
                  stroke={style.color}
                  strokeWidth={2}
                  strokeDasharray={style.dash}
                  markerEnd={markerEnd}
                  initial={false}
                  animate={{ stroke: style.color, strokeDasharray: style.dash }}
                  transition={{ duration: 0.4 }}
                />
              );
            });
          })}

          {/* Nodes */}
          {graph.map((_, i) => {
            const pos = NODE_POSITIONS[i];
            if (!pos) return null;
            
            const style = getNodeStyle(i);
            
            return (
              <motion.g
                key={`node-${i}`}
                initial={false}
                animate={{ x: pos.x, y: pos.y }}
              >
                {/* Glow Effect */}
                <motion.circle
                  r={NODE_RADIUS + 4}
                  fill="none"
                  stroke={style.glow}
                  strokeWidth={8}
                  initial={false}
                  animate={{ strokeOpacity: style.glow !== "transparent" ? 0.3 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Main Node Circle */}
                <motion.circle
                  r={NODE_RADIUS}
                  initial={false}
                  animate={{ fill: style.fill, stroke: style.stroke }}
                  strokeWidth={2.5}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Node Label */}
                <text
                  x={0}
                  y={5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={16}
                  fontWeight={600}
                  fontFamily="ui-sans-serif, system-ui"
                >
                  {i}
                </text>

                {/* "Start" badge for node 0 */}
                {i === meta.startNode && (
                  <text x={0} y={35} textAnchor="middle" fill="#71717a" fontSize={11} fontFamily="monospace">
                    start
                  </text>
                )}
              </motion.g>
            );
          })}

          {/* Current Pointer Label */}
          <AnimatePresence>
            {step.pointers.map(p => {
              if (p.label !== "current") return null;
              const pos = NODE_POSITIONS[p.index];
              if (!pos) return null;
              
              return (
                <motion.g
                  key={`ptr-${p.id || p.label}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, x: pos.x, y: pos.y - 35 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <rect x={-28} y={-10} width={56} height={18} rx={9} fill={COLOR_CYAN} />
                  <text x={0} y={3} textAnchor="middle" fill="#000000" fontSize={10} fontWeight={700} fontFamily="monospace">
                    current
                  </text>
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>

        {/* Queue Visualizer (BFS) */}
        {isBFS && (
          <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center justify-center">
          {/* Constrained width container to align the queue line and items left */}
          <div className="flex flex-col items-start w-[260px]">
            <div className="flex flex-nowrap gap-2 min-h-[32px] items-end px-1 pb-1">
              <AnimatePresence mode="popLayout">
                {queue.length === 0 && (
                  <motion.div
                    layout
                    key="queue-empty-placeholder"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-7 w-10 shrink-0 items-center justify-center rounded border-2 border-dashed border-zinc-700 bg-transparent"
                  />
                )}
                {queue.map((node, idx) => {
                  const isFront = idx === 0;
                  const isRear = idx === queue.length - 1;
                  const isMiddle = !isFront && !isRear;

                  let pointerText = "";
                  if (queue.length === 1) pointerText = "front / rear";
                  else if (isFront) pointerText = "front";
                  else if (isRear) pointerText = "rear";

                  const bgColor = isMiddle ? "bg-[#18181b]" : "bg-emerald-500";
                  const textColor = isMiddle ? "text-white" : "text-black";
                  const border = isMiddle ? "border border-zinc-600" : "border border-transparent";
                  
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.8, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: -10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      key={`queue-node-${node}`}
                      className="relative flex flex-col items-center shrink-0"
                    >
                      {pointerText && (
                        <div className="absolute -top-4 whitespace-nowrap text-[10px] font-mono font-semibold text-emerald-400">
                          {pointerText}
                        </div>
                      )}
                      <div className={cn("flex h-7 w-10 items-center justify-center rounded font-mono text-xs font-bold shadow-sm transition-colors duration-300", bgColor, textColor, border)}>
                        {node}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            
            <div className="mt-1 h-px w-full bg-zinc-600/80" />
            <div className="w-full text-center mt-1">
              <span className="text-[10px] tracking-wider text-muted-foreground font-mono">queue</span>
            </div>
          </div>
        </div>
        )}

        {/* Stack Visualizer (DFS) */}
        {isDFS && (
          <div className="absolute bottom-5 right-12 flex flex-col items-center justify-end">
            <div className="flex flex-col items-center w-[60px]">
              {/* flex-col-reverse ensures index 0 is at the bottom, and new items stack upwards */}
              <div className="flex flex-col-reverse gap-1 min-h-[40px] items-center pb-1 justify-start w-full">
                <AnimatePresence mode="popLayout">
                  {stack.length === 0 && (
                    <motion.div
                      layout
                      key="stack-empty-placeholder"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="flex h-7 w-[52px] shrink-0 items-center justify-center rounded border-2 border-dashed border-zinc-700 bg-transparent"
                    />
                  )}
                  {stack.map((node, idx) => {
                    const isTop = idx === stack.length - 1;

                    let pointerText = "";
                    if (isTop) pointerText = "top";

                    // In DFS, we will use the same styling: top is green, others are dark
                    const bgColor = isTop ? "bg-emerald-500" : "bg-[#18181b]";
                    const textColor = isTop ? "text-black" : "text-white";
                    const border = isTop ? "border border-transparent" : "border border-zinc-600";
                    
                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: -20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        key={`stack-node-${node}`}
                        className="relative flex flex-col items-center shrink-0"
                      >
                        {pointerText && (
                          <div className="absolute -top-4 whitespace-nowrap text-[10px] font-mono font-semibold text-emerald-400">
                            {pointerText}
                          </div>
                        )}
                        <div className={cn("flex h-7 w-[52px] items-center justify-center rounded font-mono text-xs font-bold shadow-sm transition-colors duration-300", bgColor, textColor, border)}>
                          {node}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              
              <div className="mt-1 h-px w-[60px] bg-zinc-600/80" />
              <div className="w-full text-center mt-1">
                <span className="text-[10px] tracking-wider text-muted-foreground font-mono">stack</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

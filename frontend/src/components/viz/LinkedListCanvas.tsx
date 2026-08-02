
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { VisualizationStep, AlgorithmMeta } from "@/types/visualization";

export const LINKED_LIST_LEGEND = [
  { label: "Head Node", className: "bg-emerald-500" },
  { label: "Current Node", className: "bg-cyan-500" },
  { label: "New Node", className: "bg-amber-500" },
];

interface LinkedListCanvasProps {
  step: VisualizationStep;
  meta: AlgorithmMeta;
}

export function LinkedListCanvas({ step, meta }: LinkedListCanvasProps) {
  void meta; // Unused but required by props
  // Read nodes and pointers from step.vars
  const nodes: { id: number; val: number; next: number | null, elevated?: boolean }[] = Array.isArray(step.vars?._nodes?.value) ? step.vars._nodes.value : [];
  
  const isError = step.description?.includes("not valid");
  
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#09090b] rounded-lg border border-white/5 items-center justify-center">
      {isError && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-50">
          <span className="text-[13px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-1.5 rounded shadow-lg backdrop-blur-md">
            {step.description} {step.nextHint}
          </span>
        </div>
      )}
      <div className="relative flex items-center min-w-full justify-center px-10">
        
        <AnimatePresence mode="popLayout">
          {nodes.map((node, idx) => {
            const isLast = idx === nodes.length - 1;
            
            // Gather which pointers are pointing to this node
            const activePointers = step.pointers?.filter((p) => p.index === node.id) || [];
            
            // Determine highlight state
            const state = step.highlights[node.id] || "idle";
            
            let borderColor = "border-zinc-700";
            let bgColor = "bg-[#18181b]";
            let textColor = "text-zinc-300";
            let glow = "";
            
            if (state === "active") {
              borderColor = "border-emerald-500";
              bgColor = "bg-[#064e3b]";
              textColor = "text-emerald-100";
              glow = "drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]";
            } else if (state === "compare") {
              borderColor = "border-amber-500";
              bgColor = "bg-[#451a03]";
              textColor = "text-amber-100";
              glow = "drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]";
            } else if (state === "key") {
              borderColor = "border-cyan-500";
              bgColor = "bg-[#083344]";
              textColor = "text-cyan-100";
              glow = "drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]";
            } else if (state === "error") {
              borderColor = "border-rose-500";
              bgColor = "bg-[#4c0519]";
              textColor = "text-rose-100";
              glow = "drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]";
            }

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8, x: -30, y: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: 0,
                  y: node.elevated ? -60 : 0 
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                key={`ll-node-${node.id}`}
                className="relative flex items-center"
              >
                {/* Node Box */}
                <div className={cn("flex flex-col relative", glow)}>
                  
                  {/* Pointers rendering */}
                  <AnimatePresence mode="popLayout">
                    {activePointers.length > 0 && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-0">
                        {activePointers.map((p) => {
                          const colorMap: Record<string, string> = {
                            "emerald": "bg-emerald-500",
                            "cyan": "bg-cyan-500",
                            "amber": "bg-amber-500",
                            "rose": "bg-rose-500",
                          };
                          const bgColor = colorMap[p.color || ""] || "bg-zinc-500";
                          return (
                            <motion.div
                              key={`ptr-${p.id}`}
                              layoutId={`ll-ptr-${p.id}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ type: "spring", stiffness: 300, damping: 25 }}
                              className="flex flex-col items-center"
                            >
                              <div className={cn("px-2 py-0.5 rounded text-[11px] font-mono font-bold text-black", bgColor)}>
                                {p.label}
                              </div>
                              <div className={cn("w-[2px] h-3", bgColor)} />
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </AnimatePresence>

                  <div className={cn("flex items-center h-10 rounded border overflow-hidden shadow-md transition-colors duration-300", borderColor, bgColor)}>
                    <div className={cn("flex items-center justify-center w-10 h-full font-mono font-bold text-sm", textColor)}>
                      {node.val}
                    </div>
                    <div className={cn("w-px h-full bg-current opacity-30")} />
                    <div className="flex items-center justify-center w-8 h-full relative">
                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                    </div>
                  </div>
                </div>

                {/* Space and optional Arrow connecting to next node */}
                {!isLast && (
                  <div className="w-10 h-10 relative flex items-center justify-center shrink-0">
                    <AnimatePresence>
                      {node.next !== null && (() => {
                        const targetIdx = nodes.findIndex((n) => n.id === node.next);
                        if (targetIdx === -1 || targetIdx <= idx) return null;

                        const nodeWidth = 75;
                        const gapWidth = 40; 
                        const width = gapWidth + (targetIdx - idx - 1) * (nodeWidth + gapWidth);
                        const isJump = targetIdx > idx + 1 && nodes.slice(idx + 1, targetIdx).some(n => !n.elevated);

                        const nodeY = node.elevated ? -60 : 0;
                        const nextNodeObj = nodes[targetIdx];
                        const nextY = nextNodeObj?.elevated ? -60 : 0;

                        // Since the gap SVG is inside the node's motion.div, its local coordinate system is shifted by nodeY.
                        // So startY is always 20 (the center of the gap).
                        // endY is 20 plus the relative difference in elevation.
                        const startY = 20;
                        const endY = 20 + (nextY - nodeY);

                        // Determine jump routing Y coordinate
                        let jumpY = endY;
                        if (isJump) {
                          jumpY = -45; // Route above the intermediate node and its pointer labels
                        }

                        // Use a consistent 6-point path (M + 5 L's) so framer-motion morphs it flawlessly!
                        // This handles straight lines, elbows, and rectangular jumps over nodes!
                        const d = `M 0,${startY} L ${gapWidth/2},${startY} L ${gapWidth/2},${jumpY} L ${width - gapWidth/2},${jumpY} L ${width - gapWidth/2},${endY} L ${width},${endY}`;

                        return (
                          <div className="absolute left-0 top-0 h-full z-10" style={{ width: `${width}px` }}>
                            <svg key="arrow" className="w-full h-full overflow-visible pointer-events-none" viewBox={`0 0 ${width} 40`} preserveAspectRatio="xMidYMid meet">
                              <motion.path
                                initial={{ pathLength: 0, opacity: 0, d }}
                                animate={{ pathLength: 1, opacity: 1, d }}
                                exit={{ pathLength: 0, opacity: 0, d }}
                                transition={{ 
                                  pathLength: { duration: 0.3 },
                                  opacity: { duration: 0.3 },
                                  default: { type: "spring", stiffness: 400, damping: 25 } 
                                }}
                                stroke="#52525b"
                                strokeWidth="3"
                                fill="none"
                                markerEnd="url(#arrowhead)"
                              />
                              <defs>
                                <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                                  <polygon points="0 0, 6 2, 0 4" fill="#52525b" />
                                </marker>
                              </defs>
                            </svg>
                          </div>
                        );
                      })()}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* If list is empty */}
        {nodes.length === 0 && (
          <div className="text-zinc-500 font-mono text-sm border border-dashed border-zinc-700 p-4 rounded bg-zinc-900/50">
            Empty List
          </div>
        )}
      </div>
    </div>
  );
}

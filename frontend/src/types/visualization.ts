export type VariableType = "int" | "float" | "string" | "bool" | "list" | "dict" | "set";

export interface VariableValue {
  value: string | number | boolean | any[];
  type: VariableType;
  /** If true, the variable was just modified in this step. */
  changed?: boolean;
}

export type HighlightState =
  | "idle"
  | "compare"
  | "swap"
  | "sorted"
  | "pivot"
  | "active"
  | "found"
  | "visited"
  | "current"
  | "key"
  | "inactive"
  | "hidden"
  | "error";

export interface Pointer {
  /** Optional ID for Framer Motion layout sliding */
  id?: string;
  /** Array/Graph index the pointer is referencing */
  index: number;
  /** Short label like "i", "j", "low", "high", "current" */
  label: string;
  /** Optional custom color mapping for the pointer badge */
  color?: "cyan" | "amber" | "purple" | "pivot" | "none" | "emerald";
}

export interface VisualizationStep {
  /** Data array state at this step (e.g., array elements) */
  data: number[];
  /** Elements currently in the temporary array (e.g. for Merge Sort) */
  tempData?: { value: number; index: number; originalIndex: number }[];
  /** Line number in the source code currently executing (1-indexed) */
  line: number;
  /** Highlights for specific indices (e.g. { 0: 'compare', 1: 'swap' }) */
  highlights: Record<number, HighlightState>;
  /** Optional current recursion depth (e.g. for Merge Sort) */
  depth?: number;
  /** Optional run dividers to draw colored lines under sections of the array */
  runs?: { start: number; end: number; color: string }[];
  /** Optional temporary array line (e.g. for Merge Sort) */
  tempLine?: { start: number; end: number };
  /** Array of active pointers for this step */
  pointers: Pointer[];
  /** User-friendly description of what's happening */
  description: string;
  /** Hint about what will happen next */
  nextHint: string;
  /** Local variables state */
  vars?: Record<string, VariableValue>;
  /** Optional performance counters like comparisons or swaps */
  counters?: {
    comparisons?: number;
    swaps?: number;
    [key: string]: number | undefined;
  };
  /** Optional custom layout IDs to enable physical box swapping in Framer Motion */
  boxIds?: string[];
  /** Step classification */
  kind: "compare" | "swap" | "pass" | "done" | "select" | "merge" | "split" | "insert" | "error";
  /** Inline comparison expression shown below bars (HTML string) */
  comparisonText?: string;
  /** Current outer-loop pass / iteration number */
  pass?: number;
  /** Ordered list of node indices for the result trajectory (e.g. for BFS/DFS) */
  trajectory?: number[];
}

export interface AlgorithmMeta {
  /** Unique URL-friendly identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Broad category (Sorting, Searching, Graphs) */
  category:
    | "Sorting"
    | "Searching"
    | "Graphs"
    | "Trees"
    | "Dynamic Programming"
    | "Linked List"
    | "Arrays"
    | "Stacks"
    | "Queues";
  /** Short summary of what the algorithm does */
  description: string;
  /** Time complexity notation */
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  /** Space complexity notation */
  spaceComplexity: string;
  /** Stability indicator (for sorting) */
  stable?: boolean;
  /** The language the code is written in (python, javascript, etc) */
  language: "python" | "javascript" | "typescript" | "go" | "rust" | "java" | "cpp";
  /** The source code lines */
  codeLines: string[];
  /** Optional graph definition (adjacency list) for graph algorithms */
  graph?: number[][];
  /** Optional start node for graph algorithms */
  startNode?: number;
}

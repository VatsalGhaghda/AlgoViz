import type { AlgorithmMeta, VisualizationStep, VariableValue } from "@/types/visualization";
import { buildHighlights } from "./utils";

export const binarySearchMeta: AlgorithmMeta = {
  id: "binary-search",
  name: "Binary Search",
  category: "Searching",
  description: "Finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.",
  timeComplexity: { best: "Ω(1)", average: "Θ(log n)", worst: "O(log n)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def binary_search(arr, target):",
    "    low = 0",
    "    high = len(arr) - 1",
    "    while low <= high:",
    "        mid = low + (high - low) // 2",
    "        if arr[mid] == target:",
    "            return mid",
    "        elif arr[mid] < target:",
    "            low = mid + 1",
    "        else:",
    "            high = mid - 1",
    "    return -1",
  ],
};

export function generateBinarySearchSteps(input: number[], userTarget?: number): VisualizationStep[] {
  // Binary search requires a sorted array
  const arr = [...input].sort((a, b) => a - b);
  const n = arr.length;
  const target = userTarget !== undefined ? userTarget : (arr[Math.floor(Math.random() * (n - 2)) + 1] ?? arr[0]);
  const steps: VisualizationStep[] = [];
  let comparisons = 0;
  let passNum = 0;

  type Vars = Record<string, VariableValue>;
  const push = (step: Omit<VisualizationStep, "data">) =>
    steps.push({ ...step, data: [...arr] });

  push({
    highlights: buildHighlights(n, new Set()),
    line: 1,
    kind: "pass",
    description: `Calling binary_search() with target=${target}. Array must be sorted.`,
    nextHint: `Initializing low=0.`,
    vars: { target: { value: target, type: "int" } },
    counters: { comparisons },
    pointers: [],
  });

  let low = 0;
  push({
    highlights: buildHighlights(n, new Set()),
    line: 2,
    kind: "pass",
    description: `low = 0`,
    nextHint: `Initializing high = len(arr) - 1.`,
    vars: {
      target: { value: target, type: "int" },
      low: { value: low, type: "int", changed: true },
    },
    counters: { comparisons },
    pointers: [{ id: "low", index: low, label: "low", color: "cyan" }],
  });

  let high = n - 1;
  push({
    highlights: buildHighlights(n, new Set()),
    line: 3,
    kind: "pass",
    description: `high = ${high}`,
    nextHint: `Starting while loop: low <= high.`,
    vars: {
      target: { value: target, type: "int" },
      low: { value: low, type: "int" },
      high: { value: high, type: "int", changed: true },
    },
    counters: { comparisons },
    pointers: [
      { id: "low", index: low, label: "low", color: "cyan" },
      { id: "high", index: high, label: "high", color: "amber" },
    ],
  });

  let foundIdx = -1;

  while (low <= high) {
    passNum++;
    
    // Highlight the active search range as 'idle' and the rest as 'inactive'
    const overrides: Record<number, any> = {};
    for (let i = 0; i < n; i++) {
      if (i < low || i > high) overrides[i] = "inactive";
    }

    push({
      highlights: buildHighlights(n, new Set(), overrides),
      line: 4,
      kind: "pass",
      description: `while low <= high (${low} <= ${high}) is TRUE.`,
      nextHint: `Calculating middle index.`,
      vars: {
        target: { value: target, type: "int" },
        low: { value: low, type: "int" },
        high: { value: high, type: "int" },
      },
      counters: { comparisons },
      pointers: [
        { id: "low", index: low, label: "low", color: "cyan" },
        { id: "high", index: high, label: "high", color: "amber" },
      ],
    });

    const mid = Math.floor(low + (high - low) / 2);
    overrides[mid] = "pivot";

    push({
      highlights: buildHighlights(n, new Set(), overrides),
      line: 5,
      kind: "pass",
      description: `Calculated mid = ${mid}.`,
      nextHint: `Comparing arr[mid] with target.`,
      vars: {
        target: { value: target, type: "int" },
        low: { value: low, type: "int" },
        high: { value: high, type: "int" },
        mid: { value: mid, type: "int", changed: true },
      },
      counters: { comparisons },
      pointers: [
        { id: "low", index: low, label: "low", color: "cyan" },
        { id: "mid", index: mid, label: "mid", color: "purple" },
        { id: "high", index: high, label: "high", color: "amber" },
      ],
    });

    const val = arr[mid];
    comparisons++;

    push({
      highlights: buildHighlights(n, new Set(), { ...overrides, [mid]: "compare" }),
      line: 6,
      kind: "compare",
      comparisonText: `<span class="text-viz-pivot">arr[${mid}] (${val})</span> <span class="text-muted-foreground/80">==</span> <span class="text-viz-compare-right">${target}</span> <span class="text-muted-foreground">?</span>`,
      description: `Checking if arr[mid] == target (${val} == ${target}).`,
      nextHint: val === target ? `Target found!` : `Not equal, checking if less than target.`,
      vars: {
        target: { value: target, type: "int" },
        low: { value: low, type: "int" },
        high: { value: high, type: "int" },
        mid: { value: mid, type: "int" },
        "arr[mid]": { value: val, type: "int", changed: true },
      },
      counters: { comparisons },
      pointers: [
        { id: "low", index: low, label: "low", color: "cyan" },
        { id: "mid", index: mid, label: "mid", color: "purple" },
        { id: "high", index: high, label: "high", color: "amber" },
      ],
    });

    if (val === target) {
      foundIdx = mid;
      push({
        highlights: buildHighlights(n, new Set(), { ...overrides, [mid]: "found" }),
        line: 7,
        kind: "pass",
        description: `Found target ${target} at index ${mid}! Returning ${mid}.`,
        nextHint: `Execution finished.`,
        vars: {
          target: { value: target, type: "int" },
          low: { value: low, type: "int" },
          high: { value: high, type: "int" },
          mid: { value: mid, type: "int" },
        },
        counters: { comparisons },
        pointers: [{ id: "found", index: mid, label: "found", color: "amber" }],
      });
      break;
    }

    push({
      highlights: buildHighlights(n, new Set(), { ...overrides, [mid]: "compare" }),
      line: 8,
      kind: "compare",
      comparisonText: `<span class="text-viz-pivot">arr[${mid}] (${val})</span> <span class="text-muted-foreground/80">&lt;</span> <span class="text-viz-compare-right">${target}</span> <span class="text-muted-foreground">?</span>`,
      description: `Checking if arr[mid] < target (${val} < ${target}).`,
      nextHint: val < target ? `Target must be in right half. Setting low = mid + 1.` : `Target must be in left half. Setting high = mid - 1.`,
      vars: {
        target: { value: target, type: "int" },
        low: { value: low, type: "int" },
        high: { value: high, type: "int" },
        mid: { value: mid, type: "int" },
        "arr[mid]": { value: val, type: "int", changed: true },
      },
      counters: { comparisons },
      pointers: [
        { id: "low", index: low, label: "low", color: "cyan" },
        { id: "mid", index: mid, label: "mid", color: "purple" },
        { id: "high", index: high, label: "high", color: "amber" },
      ],
    });

    if (val < target) {
      low = mid + 1;
      push({
        highlights: buildHighlights(n, new Set(), overrides),
        line: 9,
        kind: "pass",
        description: `Set low = ${low}.`,
        nextHint: `Looping back.`,
        vars: {
          target: { value: target, type: "int" },
          low: { value: low, type: "int", changed: true },
          high: { value: high, type: "int" },
          mid: { value: mid, type: "int" },
        },
        counters: { comparisons },
        pointers: [
          { id: "low", index: low, label: "low", color: "cyan" },
          { id: "high", index: high, label: "high", color: "amber" },
        ],
      });
    } else {
      high = mid - 1;
      push({
        highlights: buildHighlights(n, new Set(), overrides),
        line: 11,
        kind: "pass",
        description: `Set high = ${high}.`,
        nextHint: `Looping back.`,
        vars: {
          target: { value: target, type: "int" },
          low: { value: low, type: "int" },
          high: { value: high, type: "int", changed: true },
          mid: { value: mid, type: "int" },
        },
        counters: { comparisons },
        pointers: [
          { id: "low", index: low, label: "low", color: "cyan" },
          { id: "high", index: high, label: "high", color: "amber" },
        ],
      });
    }
  }

  if (foundIdx === -1) {
    push({
      highlights: buildHighlights(n, new Set()),
      line: 12,
      kind: "pass",
      description: `low > high (${low} > ${high}). Loop terminates. Returning -1.`,
      nextHint: `Execution finished.`,
      vars: {
        target: { value: target, type: "int" },
        low: { value: low, type: "int" },
        high: { value: high, type: "int" },
      },
      counters: { comparisons },
      pointers: [],
    });
  }

  push({
    highlights: buildHighlights(n, new Set(), foundIdx !== -1 ? { [foundIdx]: "found" } : {}),
    line: foundIdx !== -1 ? 7 : 12,
    kind: "done",
    description: foundIdx !== -1 ? `Target found at index ${foundIdx}.` : `Target not found (-1).`,
    nextHint: `Algorithm complete.`,
    vars: { result: { value: foundIdx, type: "int", changed: true } },
    counters: { comparisons },
    pointers: foundIdx !== -1 ? [{ id: "found", index: foundIdx, label: "found", color: "amber" }] : [],
  });

  return steps;
}

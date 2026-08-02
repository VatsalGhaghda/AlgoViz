import type { AlgorithmMeta, VisualizationStep, VariableValue } from "@/types/visualization";
import { buildHighlights } from "./utils";

export const linearSearchMeta: AlgorithmMeta = {
  id: "linear-search",
  name: "Linear Search",
  category: "Searching",
  description: "Searches for a target value by checking each element sequentially from start to end.",
  timeComplexity: { best: "Ω(1)", average: "Θ(n)", worst: "O(n)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def linear_search(arr, target):",
    "    n = len(arr)",
    "    for i in range(n):",
    "        if arr[i] == target:",
    "            return i",
    "    return -1",
  ],
};

export function generateLinearSearchSteps(input: number[], userTarget?: number): VisualizationStep[] {
  const arr = [...input];
  const n = arr.length;
  const target = userTarget !== undefined ? userTarget : (arr[Math.floor(Math.random() * (n - 2)) + 1] ?? arr[0]);
  const steps: VisualizationStep[] = [];
  let comparisons = 0;
  let visitedIndices = new Set<number>();

  type Vars = Record<string, VariableValue>;
  const push = (step: Omit<VisualizationStep, "data">) =>
    steps.push({ ...step, data: [...arr] });

  push({
    highlights: buildHighlights(n, new Set()),
    line: 1,
    kind: "pass",
    description: `Calling linear_search(arr, target=${target}).`,
    nextHint: `n = len(arr) will compute the array length.`,
    vars: { target: { value: target, type: "int" } },
    counters: { comparisons },
    pointers: [],
  });

  push({
    highlights: buildHighlights(n, new Set()),
    line: 2,
    kind: "pass",
    description: `n = len(arr) → n is ${n}.`,
    nextHint: `Starting for loop from i = 0 to ${n - 1}.`,
    vars: {
      target: { value: target, type: "int" },
      n: { value: n, type: "int", changed: true },
    },
    counters: { comparisons },
    pointers: [],
  });

  let foundIdx = -1;

  for (let i = 0; i < n; i++) {
    const passNum = i + 1;
    visitedIndices.add(i);

    push({
      highlights: buildHighlights(n, new Set(), { [i]: "current" }),
      line: 3,
      kind: "pass",
      description: `Loop iteration i = ${i}.`,
      nextHint: `Comparing arr[${i}] with target ${target}.`,
      vars: {
        target: { value: target, type: "int" },
        n: { value: n, type: "int" },
        i: { value: i, type: "int", changed: true },
      },
      counters: { comparisons },
      pointers: [{ id: "i", index: i, label: "i", color: "cyan" }],
    });

    const val = arr[i];
    const isMatch = val === target;
    comparisons++;

    const comparisonText = `<span class="text-viz-compare-left">arr[${i}] (${val})</span> <span class="text-muted-foreground/80">==</span> <span class="text-viz-compare-right">${target}</span> <span class="text-muted-foreground">?</span>`;

    push({
      highlights: buildHighlights(n, new Set(), { [i]: "compare" }),
      line: 4,
      kind: "compare",
      comparisonText,
      description: `arr[${i}]=${val} == ${target} is ${isMatch ? "TRUE" : "FALSE"}.`,
      nextHint: isMatch
        ? `Match found! Returning index ${i}.`
        : `No match. Continuing to next element.`,
      vars: {
        target: { value: target, type: "int" },
        n: { value: n, type: "int" },
        i: { value: i, type: "int" },
        "arr[i]": { value: val, type: "int", changed: true },
      },
      counters: { comparisons },
      pointers: [{ id: "i", index: i, label: "i", color: "cyan" }],
    });

    if (isMatch) {
      foundIdx = i;
      push({
        highlights: buildHighlights(n, new Set(), { [i]: "found" }),
        line: 5,
        kind: "pass",
        description: `Target ${target} found at index ${i}. Returning ${i}.`,
        nextHint: `Execution finished.`,
        vars: {
          target: { value: target, type: "int" },
          n: { value: n, type: "int" },
          i: { value: i, type: "int" },
        },
        counters: { comparisons },
        pointers: [{ id: "found", index: i, label: "found", color: "amber" }],
      });
      break;
    }
  }

  if (foundIdx === -1) {
    push({
      highlights: buildHighlights(n, new Set()),
      line: 6,
      kind: "pass",
      description: `Loop finished, target not found in array. Returning -1.`,
      nextHint: `Execution finished.`,
      vars: {
        target: { value: target, type: "int" },
        n: { value: n, type: "int" },
      },
      counters: { comparisons },
      pointers: [],
    });
  }

  push({
    highlights: buildHighlights(n, new Set(), foundIdx !== -1 ? { [foundIdx]: "found" } : {}),
    line: foundIdx !== -1 ? 5 : 6,
    kind: "done",
    description: foundIdx !== -1 ? `Target found at index ${foundIdx}.` : `Target not found (-1).`,
    nextHint: `Algorithm complete.`,
    vars: { result: { value: foundIdx, type: "int", changed: true } },
    counters: { comparisons },
    pointers: foundIdx !== -1 ? [{ id: "found", index: foundIdx, label: "found", color: "amber" }] : [],
  });

  return steps;
}

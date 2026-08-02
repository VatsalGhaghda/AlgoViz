import type { AlgorithmMeta, VisualizationStep, VariableValue } from "@/types/visualization";
import { buildHighlights } from "./utils";

export const selectionSortMeta: AlgorithmMeta = {
  id: "selection-sort",
  name: "Selection Sort",
  category: "Sorting",
  description:
    "Finds the minimum element from the unsorted part of the array and puts it at the beginning.",
  timeComplexity: { best: "Ω(n²)", average: "Θ(n²)", worst: "O(n²)" },
  spaceComplexity: "O(1)",
  stable: false,
  language: "python",
  codeLines: [
    "def selection_sort(arr):",
    "    n = len(arr)",
    "    for i in range(n):",
    "        min_idx = i",
    "        for j in range(i + 1, n):",
    "            if arr[j] < arr[min_idx]:",
    "                min_idx = j",
    "        arr[i], arr[min_idx] = arr[min_idx], arr[i]",
    "    return arr",
  ],
};

export function generateSelectionSortSteps(input: number[]): VisualizationStep[] {
  const arr = [...input];
  const n = arr.length;
  const steps: VisualizationStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  let sortedIndices = new Set<number>();

  type Vars = Record<string, VariableValue>;
  const push = (step: Omit<VisualizationStep, "data">) =>
    steps.push({ ...step, data: [...arr] });

  push({
    highlights: buildHighlights(n, sortedIndices),
    line: 1,
    kind: "pass",
    description: `Calling selection_sort() with array of ${n} elements.`,
    nextHint: "n = len(arr) will compute the array length.",
    vars: {},
    counters: { comparisons, swaps },
    pointers: [],
  });

  push({
    highlights: buildHighlights(n, sortedIndices),
    line: 2,
    kind: "pass",
    description: `n = len(arr) → n is ${n}.`,
    nextHint: "The outer loop starts its first pass over the array.",
    vars: { n: { value: n, type: "int", changed: true } },
    counters: { comparisons, swaps },
    pointers: [],
  });

  for (let i = 0; i < n; i++) {
    const passNum = i + 1;
    let min_idx = i;

    push({
      highlights: buildHighlights(n, sortedIndices),
      line: 3,
      kind: "pass",
      pass: passNum,
      description: `Outer loop iteration starting with i = ${i}.`,
      nextHint: `Assuming element at index ${i} is the minimum.`,
      vars: {
        n: { value: n, type: "int" },
        i: { value: i, type: "int", changed: true },
      },
      counters: { comparisons, swaps },
      pointers: [{ index: i, label: "i", color: "cyan" }],
    });

    push({
      highlights: buildHighlights(n, sortedIndices, { [min_idx]: "pivot" }),
      line: 4,
      kind: "pass",
      pass: passNum,
      description: `Set min_idx = ${i}.`,
      nextHint: `Inner loop will scan from ${i + 1} to ${n - 1} to find smaller elements.`,
      vars: {
        n: { value: n, type: "int" },
        i: { value: i, type: "int" },
        min_idx: { value: min_idx, type: "int", changed: true },
      },
      counters: { comparisons, swaps },
      pointers: [
        { index: i, label: "i", color: "cyan" },
        { index: min_idx, label: "min", color: "purple" },
      ],
    });

    for (let j = i + 1; j < n; j++) {
      push({
        highlights: buildHighlights(n, sortedIndices, { [min_idx]: "pivot" }),
        line: 5,
        kind: "pass",
        pass: passNum,
        description: `Inner loop iteration starting with j = ${j}.`,
        nextHint: `Comparing arr[${j}] with current minimum arr[${min_idx}].`,
        vars: {
          n: { value: n, type: "int" },
          i: { value: i, type: "int" },
          min_idx: { value: min_idx, type: "int" },
          j: { value: j, type: "int", changed: true },
        },
        counters: { comparisons, swaps },
        pointers: [
          { index: i, label: "i", color: "cyan" },
          { index: min_idx, label: "min", color: "purple" },
          { index: j, label: "j", color: "amber" },
        ],
      });

      const a = arr[j];
      const b = arr[min_idx];
      const isSmaller = a < b;
      comparisons++;

      const compareVars: Vars = {
        n: { value: n, type: "int" },
        i: { value: i, type: "int" },
        min_idx: { value: min_idx, type: "int" },
        j: { value: j, type: "int" },
        "arr[j]": { value: a, type: "int", changed: true },
        "arr[min_idx]": { value: b, type: "int", changed: true },
      };

      const comparisonText = `<span class="text-viz-compare-right">${a}</span> <span class="text-muted-foreground/80">&lt;</span> <span class="text-viz-pivot">${b}</span> <span class="text-muted-foreground">?</span>`;

      push({
        highlights: buildHighlights(n, sortedIndices, { [min_idx]: "pivot", [j]: "compare" }),
        line: 6,
        kind: "compare",
        pass: passNum,
        comparisonText,
        description: `Comparing arr[${j}]=${a} and arr[${min_idx}]=${b} — ${a} < ${b} is ${isSmaller ? "TRUE" : "FALSE"}.`,
        nextHint: isSmaller
          ? `Found a new minimum! Updating min_idx.`
          : `Not smaller, moving on.`,
        vars: compareVars,
        counters: { comparisons, swaps },
        pointers: [
          { index: i, label: "i", color: "cyan" },
          { index: min_idx, label: "min", color: "purple" },
          { index: j, label: "j", color: "amber" },
        ],
      });

      if (isSmaller) {
        min_idx = j;
        
        push({
          highlights: buildHighlights(n, sortedIndices, { [min_idx]: "pivot" }),
          line: 7,
          kind: "pass",
          pass: passNum,
          description: `Updated min_idx to ${j}.`,
          nextHint: `Continuing to search rest of array.`,
          vars: {
            n: { value: n, type: "int" },
            i: { value: i, type: "int" },
            j: { value: j, type: "int" },
            min_idx: { value: min_idx, type: "int", changed: true },
          },
          counters: { comparisons, swaps },
          pointers: [
            { index: i, label: "i", color: "cyan" },
            { index: min_idx, label: "min", color: "purple" },
            { index: j, label: "j", color: "amber" },
          ],
        });
      }
    }

    if (min_idx !== i) {
      const a = arr[i];
      const b = arr[min_idx];
      arr[i] = b;
      arr[min_idx] = a;
      swaps++;

      const swapText = `<span class="text-viz-compare-left">${a}</span> <span class="text-muted-foreground">↔</span> <span class="text-viz-pivot">${b}</span> <span class="text-muted-foreground">→</span> <span class="text-viz-active font-bold">swap</span>`;

      push({
        highlights: buildHighlights(n, sortedIndices, { [i]: "swap", [min_idx]: "swap" }),
        line: 8,
        kind: "swap",
        pass: passNum,
        comparisonText: swapText,
        description: `Swapping arr[${i}]=${a} with arr[${min_idx}]=${b}.`,
        nextHint: `Element at index ${i} is now in its correct position.`,
        vars: {
          n: { value: n, type: "int" },
          i: { value: i, type: "int" },
          min_idx: { value: min_idx, type: "int" },
          "arr[i]": { value: arr[i], type: "int", changed: true },
          "arr[min_idx]": { value: arr[min_idx], type: "int", changed: true },
        },
        counters: { comparisons, swaps },
        pointers: [
          { index: i, label: "i", color: "cyan" },
          { index: min_idx, label: "min", color: "purple" },
        ],
      });
    } else {
      push({
        highlights: buildHighlights(n, sortedIndices, { [i]: "pivot" }),
        line: 8,
        kind: "pass",
        pass: passNum,
        description: `min_idx is still ${i}, no swap needed.`,
        nextHint: `Element at index ${i} is now in its correct position.`,
        vars: {
          n: { value: n, type: "int" },
          i: { value: i, type: "int" },
          min_idx: { value: min_idx, type: "int" },
        },
        counters: { comparisons, swaps },
        pointers: [
          { index: i, label: "i", color: "cyan" },
          { index: min_idx, label: "min", color: "purple" },
        ],
      });
    }

    sortedIndices.add(i);
  }

  // Done
  push({
    highlights: buildHighlights(n, sortedIndices),
    line: 9,
    kind: "done",
    description: `Sorted: [${arr.join(", ")}]. Total: ${comparisons} comparisons, ${swaps} swaps.`,
    nextHint: "Execution finished.",
    vars: { n: { value: n, type: "int" }, result: { value: `[${arr.join(", ")}]`, type: "list", changed: true } },
    counters: { comparisons, swaps },
    pointers: [],
  });

  return steps;
}

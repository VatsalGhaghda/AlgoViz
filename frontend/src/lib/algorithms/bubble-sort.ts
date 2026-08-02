import type { AlgorithmMeta, VisualizationStep, VariableValue } from "@/types/visualization";
import { buildHighlights } from "./utils";

export const bubbleSortMeta: AlgorithmMeta = {
  id: "bubble-sort",
  name: "Bubble Sort",
  category: "Sorting",
  description:
    "Compares adjacent elements and swaps them if out of order — repeating until the array is sorted.",
  timeComplexity: { best: "Ω(n)", average: "Θ(n²)", worst: "O(n²)" },
  spaceComplexity: "O(1)",
  stable: true,
  language: "python",
  codeLines: [
    "def bubble_sort(arr):",
    "    n = len(arr)",
    "    for i in range(n):",
    "        swapped = False",
    "        for j in range(0, n - i - 1):",
    "            if arr[j] > arr[j + 1]:",
    "                arr[j], arr[j + 1] = arr[j + 1], arr[j]",
    "                swapped = True",
    "        if not swapped:",
    "            break",
    "    return arr",
  ],
};

export function generateBubbleSortSteps(input: number[]): VisualizationStep[] {
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
    description: `Calling bubble_sort() with array of ${n} elements.`,
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
    let swapped = false;
    const passNum = i + 1;

    push({
      highlights: buildHighlights(n, sortedIndices),
      line: 3,
      kind: "pass",
      pass: passNum,
      description: `Outer loop iteration starting with i = ${i}.`,
      nextHint: `Resetting swapped flag to False for this pass.`,
      vars: {
        n: { value: n, type: "int" },
        i: { value: i, type: "int", changed: true },
      },
      counters: { comparisons, swaps },
      pointers: [],
    });

    push({
      highlights: buildHighlights(n, sortedIndices),
      line: 4,
      kind: "pass",
      pass: passNum,
      description: `Outer loop: i=${i}. Starting pass ${passNum}, swapped = False.`,
      nextHint: `Inner loop will scan indices 0…${Math.max(n - i - 2, 0)}.`,
      vars: {
        n: { value: n, type: "int" },
        i: { value: i, type: "int" },
        swapped: { value: false, type: "bool", changed: true },
      },
      counters: { comparisons, swaps },
      pointers: [],
    });

    for (let j = 0; j < n - i - 1; j++) {
      push({
        highlights: buildHighlights(n, sortedIndices),
        line: 5,
        kind: "pass",
        pass: passNum,
        description: `Inner loop iteration starting with j = ${j}.`,
        nextHint: `Comparing elements at indices ${j} and ${j + 1}.`,
        vars: {
          n: { value: n, type: "int" },
          i: { value: i, type: "int" },
          swapped: { value: false, type: "bool" },
          j: { value: j, type: "int", changed: true },
        },
        counters: { comparisons, swaps },
        pointers: [
          { index: j, label: "j", color: "cyan" },
          { index: j + 1, label: "j+1", color: "amber" },
        ],
      });

      const a = arr[j];
      const b = arr[j + 1];
      const willSwap = a > b;
      comparisons++;

      const compareVars: Vars = {
        n: { value: n, type: "int" },
        i: { value: i, type: "int" },
        j: { value: j, type: "int", changed: true },
        swapped: { value: swapped, type: "bool" },
        "arr[j]": { value: a, type: "int", changed: true },
        "arr[j+1]": { value: b, type: "int", changed: true },
      };

      const comparisonText = `<span class="text-viz-compare-left">${a}</span> <span class="text-muted-foreground/80">&gt;</span> <span class="text-viz-compare-right">${b}</span> <span class="text-muted-foreground">?</span>`;

      push({
        highlights: buildHighlights(n, sortedIndices, { [j]: "compare", [j + 1]: "compare" }),
        line: 6,
        kind: "compare",
        pass: passNum,
        comparisonText,
        description: `Comparing arr[${j}]=${a} and arr[${j + 1}]=${b} — ${a} > ${b} is ${willSwap ? "TRUE" : "FALSE"}.`,
        nextHint: willSwap
          ? `arr[${j}] and arr[${j + 1}] will be swapped.`
          : `Order is correct — inner loop advances to j=${j + 1}.`,
        vars: compareVars,
        counters: { comparisons, swaps },
        pointers: [
          { index: j, label: "j", color: "cyan" },
          { index: j + 1, label: "j+1", color: "amber" },
        ],
      });

      if (willSwap) {
        arr[j] = b;
        arr[j + 1] = a;
        swaps++;

        const swapText = `<span class="text-viz-compare-left">${a}</span> <span class="text-muted-foreground/80">&gt;</span> <span class="text-viz-compare-right">${b}</span> <span class="text-muted-foreground">→</span> <span class="text-viz-active font-bold">swap</span>`;

        push({
          highlights: buildHighlights(n, sortedIndices, { [j]: "swap", [j + 1]: "swap" }),
          line: 7,
          kind: "swap",
          pass: passNum,
          comparisonText: swapText,
          description: `Swapped arr[${j}] ↔ arr[${j + 1}] → [${arr.join(", ")}].`,
          nextHint: `Setting swapped = True.`,
          vars: {
            n: { value: n, type: "int" },
            i: { value: i, type: "int" },
            j: { value: j, type: "int" },
            swapped: { value: swapped, type: "bool" },
            "arr[j]": { value: arr[j], type: "int", changed: true },
            "arr[j+1]": { value: arr[j + 1], type: "int", changed: true },
          },
          counters: { comparisons, swaps },
          pointers: [
            { index: j, label: "j", color: "cyan" },
            { index: j + 1, label: "j+1", color: "amber" },
          ],
        });

        swapped = true;

        push({
          highlights: buildHighlights(n, sortedIndices, { [j]: "swap", [j + 1]: "swap" }),
          line: 8,
          kind: "swap",
          pass: passNum,
          comparisonText: swapText + `<span class="text-muted-foreground">, swapped = </span><span class="text-viz-sorted">True</span>`,
          description: `Set swapped = True since a swap occurred.`,
          nextHint: `Inner loop advances.`,
          vars: {
            n: { value: n, type: "int" },
            i: { value: i, type: "int" },
            j: { value: j, type: "int" },
            swapped: { value: true, type: "bool", changed: true },
            "arr[j]": { value: arr[j], type: "int" },
            "arr[j+1]": { value: arr[j + 1], type: "int" },
          },
          counters: { comparisons, swaps },
          pointers: [
            { index: j, label: "j", color: "cyan" },
            { index: j + 1, label: "j+1", color: "amber" },
          ],
        });
      }
    }

    sortedIndices.add(n - i - 1);
    
    const passEndVars: Vars = {
      n: { value: n, type: "int" },
      i: { value: i, type: "int" },
      swapped: { value: swapped, type: "bool" },
    };

    push({
      highlights: buildHighlights(n, sortedIndices),
      line: 9,
      kind: "pass",
      pass: passNum,
      description: `Pass ${passNum} complete. Index ${n - i - 1} is now locked.`,
      nextHint: swapped
        ? "swapped is True — another pass is required."
        : "swapped is False — the array is sorted, loop breaks early.",
      vars: passEndVars,
      counters: { comparisons, swaps },
      pointers: [],
    });

    if (!swapped) {
      push({
        highlights: buildHighlights(n, sortedIndices),
        line: 10,
        kind: "pass",
        pass: passNum,
        description: `No swaps occurred, array is completely sorted. Breaking early.`,
        nextHint: `Returning the sorted array.`,
        vars: passEndVars,
        counters: { comparisons, swaps },
        pointers: [],
      });
      // All remaining elements are sorted
      for(let k = 0; k < n; k++) sortedIndices.add(k);
      break;
    }
  }

  // All remaining elements are sorted
  for(let k = 0; k < n; k++) sortedIndices.add(k);

  push({
    highlights: buildHighlights(n, sortedIndices),
    line: 11,
    kind: "done",
    description: `Sorted: [${arr.join(", ")}]. Total: ${comparisons} comparisons, ${swaps} swaps.`,
    nextHint: "Execution finished.",
    vars: { n: { value: n, type: "int" }, result: { value: `[${arr.join(", ")}]`, type: "list", changed: true } },
    counters: { comparisons, swaps },
    pointers: [],
  });

  return steps;
}

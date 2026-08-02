import type { AlgorithmMeta, VisualizationStep, VariableValue } from "@/types/visualization";
import { buildHighlights } from "./utils";

export const quickSortMeta: AlgorithmMeta = {
  id: "quick-sort",
  name: "Quick Sort",
  category: "Sorting",
  description:
    "Selects a pivot, partitions the array into elements less than and greater than the pivot, and recursively sorts the sub-arrays.",
  timeComplexity: { best: "Ω(n log n)", average: "Θ(n log n)", worst: "O(n²)" },
  spaceComplexity: "O(log n)",
  stable: false,
  language: "python",
  codeLines: [
    "def quick_sort(arr, low, high):",
    "    if low < high:",
    "        pivot_idx = partition(arr, low, high)",
    "        quick_sort(arr, low, pivot_idx - 1)",
    "        quick_sort(arr, pivot_idx + 1, high)",
    "    return arr",
    "",
    "def partition(arr, low, high):",
    "    pivot = arr[high]",
    "    i = low - 1",
    "    for j in range(low, high):",
    "        if arr[j] <= pivot:",
    "            i = i + 1",
    "            arr[i], arr[j] = arr[j], arr[i]",
    "    arr[i + 1], arr[high] = arr[high], arr[i + 1]",
    "    return i + 1",
  ],
};

export function generateQuickSortSteps(input: number[]): VisualizationStep[] {
  const arr = [...input];
  const n = arr.length;
  const steps: VisualizationStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  let sortedIndices = new Set<number>();
  let passNum = 0;

  type Vars = Record<string, VariableValue>;
  const push = (step: Omit<VisualizationStep, "data">) =>
    steps.push({ ...step, data: [...arr] });

  push({
    highlights: buildHighlights(n, sortedIndices),
    line: 1,
    kind: "pass",
    description: `Calling quick_sort() with array of ${n} elements.`,
    nextHint: `Starting initial call with low=0, high=${n - 1}.`,
    vars: {},
    counters: { comparisons, swaps },
    pointers: [],
  });

  function qs(low: number, high: number) {
    const isBaseCase = low >= high;
    const qsVars: Vars = {
      low: { value: low, type: "int" },
      high: { value: high, type: "int" },
    };

    push({
      highlights: buildHighlights(n, sortedIndices, {}, { low, high }),
      line: 2,
      kind: "pass",
      description: `quick_sort(low=${low}, high=${high}): Checking if low < high.`,
      nextHint: isBaseCase
        ? `Base case reached. Sub-array is size 1 or 0 and is sorted.`
        : `Array is size >= 2. Proceeding to partition.`,
      vars: qsVars,
      counters: { comparisons, swaps },
      pointers: [],
    });

    if (low < high) {
      passNum++;
      const currentPass = passNum;
      
      push({
        highlights: buildHighlights(n, sortedIndices, {}, { low, high }),
        line: 3,
        kind: "pass",
        pass: currentPass,
        description: `Calling partition(arr, ${low}, ${high}).`,
        nextHint: `Partition will select a pivot and rearrange elements.`,
        vars: qsVars,
        counters: { comparisons, swaps },
        pointers: [],
      });

      const pivot_idx = partition(low, high, currentPass);

      push({
        highlights: buildHighlights(n, sortedIndices, {}, { low, high }),
        line: 4,
        kind: "pass",
        pass: currentPass,
        description: `Recursively sorting left sub-array: low=${low} to high=${pivot_idx - 1}.`,
        nextHint: `Calling quick_sort(${low}, ${pivot_idx - 1}).`,
        vars: { ...qsVars, pivot_idx: { value: pivot_idx, type: "int" } },
        counters: { comparisons, swaps },
        pointers: [],
      });
      qs(low, pivot_idx - 1);

      push({
        highlights: buildHighlights(n, sortedIndices, {}, { low, high }),
        line: 5,
        kind: "pass",
        pass: currentPass,
        description: `Recursively sorting right sub-array: low=${pivot_idx + 1} to high=${high}.`,
        nextHint: `Calling quick_sort(${pivot_idx + 1}, ${high}).`,
        vars: { ...qsVars, pivot_idx: { value: pivot_idx, type: "int" } },
        counters: { comparisons, swaps },
        pointers: [],
      });
      qs(pivot_idx + 1, high);
    } else if (low === high) {
      sortedIndices.add(low);
    }
  }

  function partition(low: number, high: number, passId: number): number {
    const pivot = arr[high];
    
    push({
      highlights: buildHighlights(n, sortedIndices, { [high]: "pivot" }, { low, high }),
      line: 9,
      kind: "pass",
      pass: passId,
      description: `partition(): Choosing arr[high] as pivot. pivot = ${pivot}.`,
      nextHint: `i will track the boundary of elements <= pivot.`,
      vars: {
        low: { value: low, type: "int" },
        high: { value: high, type: "int" },
        pivot: { value: pivot, type: "int", changed: true },
      },
      counters: { comparisons, swaps },
      pointers: [
        { index: high, label: "pivot", color: "purple" },
      ],
    });

    let i = low - 1;

    push({
      highlights: buildHighlights(n, sortedIndices, { [high]: "pivot" }, { low, high }),
      line: 10,
      kind: "pass",
      pass: passId,
      description: `Set i = ${i}.`,
      nextHint: `Iterating j from ${low} to ${high - 1}.`,
      vars: {
        low: { value: low, type: "int" },
        high: { value: high, type: "int" },
        pivot: { value: pivot, type: "int" },
        i: { value: i, type: "int", changed: true },
      },
      counters: { comparisons, swaps },
      pointers: [
        ...(i >= 0 ? [{ index: i, label: "i", color: "cyan" as const }] : []),
        { index: high, label: "pivot", color: "purple" as const },
      ],
    });

    for (let j = low; j < high; j++) {
      push({
        highlights: buildHighlights(n, sortedIndices, { [high]: "pivot", [j]: "compare" }, { low, high }),
        line: 11,
        kind: "pass",
        pass: passId,
        description: `Loop j = ${j}.`,
        nextHint: `Comparing arr[${j}] with pivot.`,
        vars: {
          low: { value: low, type: "int" },
          high: { value: high, type: "int" },
          pivot: { value: pivot, type: "int" },
          i: { value: i, type: "int" },
          j: { value: j, type: "int", changed: true },
        },
        counters: { comparisons, swaps },
        pointers: [
          ...(i >= 0 ? [{ index: i, label: "i", color: "cyan" as const }] : []),
          { index: j, label: "j", color: "amber" as const },
          { index: high, label: "pivot", color: "purple" as const },
        ],
      });

      const val = arr[j];
      const isLessEqual = val <= pivot;
      comparisons++;

      const comparisonText = `<span class="text-viz-compare-right">${val}</span> <span class="text-muted-foreground/80">&lt;=</span> <span class="text-viz-pivot">${pivot}</span> <span class="text-muted-foreground">?</span>`;

      push({
        highlights: buildHighlights(n, sortedIndices, { [high]: "pivot", [j]: "compare" }, { low, high }),
        line: 12,
        kind: "compare",
        pass: passId,
        comparisonText,
        description: `arr[${j}]=${val} <= ${pivot} is ${isLessEqual ? "TRUE" : "FALSE"}.`,
        nextHint: isLessEqual
          ? `Condition met. Will increment i and swap arr[i] with arr[j].`
          : `Condition not met. Continue to next j.`,
        vars: {
          low: { value: low, type: "int" },
          high: { value: high, type: "int" },
          pivot: { value: pivot, type: "int" },
          i: { value: i, type: "int" },
          j: { value: j, type: "int" },
          "arr[j]": { value: val, type: "int", changed: true },
        },
        counters: { comparisons, swaps },
        pointers: [
          ...(i >= 0 ? [{ index: i, label: "i", color: "cyan" as const }] : []),
          { index: j, label: "j", color: "amber" as const },
          { index: high, label: "pivot", color: "purple" as const },
        ],
      });

      if (isLessEqual) {
        i++;
        
        push({
          highlights: buildHighlights(n, sortedIndices, { [high]: "pivot", [j]: "compare" }, { low, high }),
          line: 13,
          kind: "pass",
          pass: passId,
          description: `Incremented i to ${i}.`,
          nextHint: `Swapping arr[${i}] and arr[${j}].`,
          vars: {
            low: { value: low, type: "int" },
            high: { value: high, type: "int" },
            pivot: { value: pivot, type: "int" },
            j: { value: j, type: "int" },
            i: { value: i, type: "int", changed: true },
          },
          counters: { comparisons, swaps },
          pointers: [
            { index: i, label: "i", color: "cyan" },
            { index: j, label: "j", color: "amber" },
            { index: high, label: "pivot", color: "purple" },
          ],
        });

        const a = arr[i];
        const b = arr[j];
        if (i !== j) {
          arr[i] = b;
          arr[j] = a;
          swaps++;

          const swapText = `<span class="text-viz-compare-left">${a}</span> <span class="text-muted-foreground">↔</span> <span class="text-viz-compare-right">${b}</span> <span class="text-muted-foreground">→</span> <span class="text-viz-active font-bold">swap</span>`;

          push({
            highlights: buildHighlights(n, sortedIndices, { [high]: "pivot", [i]: "swap", [j]: "swap" }, { low, high }),
            line: 14,
            kind: "swap",
            pass: passId,
            comparisonText: swapText,
            description: `Swapped arr[${i}] and arr[${j}].`,
            nextHint: `Boundary expanded. Continuing loop.`,
            vars: {
              low: { value: low, type: "int" },
              high: { value: high, type: "int" },
              pivot: { value: pivot, type: "int" },
              j: { value: j, type: "int" },
              i: { value: i, type: "int" },
              "arr[i]": { value: arr[i], type: "int", changed: true },
              "arr[j]": { value: arr[j], type: "int", changed: true },
            },
            counters: { comparisons, swaps },
            pointers: [
              { index: i, label: "i", color: "cyan" },
              { index: j, label: "j", color: "amber" },
              { index: high, label: "pivot", color: "purple" },
            ],
          });
        }
      }
    }

    // Final swap
    const pi = i + 1;
    const a = arr[pi];
    const b = arr[high];
    
    if (pi !== high) {
      arr[pi] = b;
      arr[high] = a;
      swaps++;

      const swapText = `<span class="text-viz-compare-left">${a}</span> <span class="text-muted-foreground">↔</span> <span class="text-viz-pivot">${b}</span> <span class="text-muted-foreground">→</span> <span class="text-viz-active font-bold">swap</span>`;

      push({
        highlights: buildHighlights(n, sortedIndices, { [pi]: "swap", [high]: "swap" }, { low, high }),
        line: 15,
        kind: "swap",
        pass: passId,
        comparisonText: swapText,
        description: `Loop done. Swapping pivot arr[${high}] with arr[${pi}] to place it in its correct sorted position.`,
        nextHint: `Returning pivot index ${pi}.`,
        vars: {
          low: { value: low, type: "int" },
          high: { value: high, type: "int" },
          pivot: { value: pivot, type: "int" },
          i: { value: i, type: "int" },
        },
        counters: { comparisons, swaps },
        pointers: [
          { index: pi, label: "i+1", color: "cyan" },
          { index: high, label: "pivot", color: "purple" },
        ],
      });
    }

    sortedIndices.add(pi);

    push({
      highlights: buildHighlights(n, sortedIndices, {}, { low, high }),
      line: 16,
      kind: "pass",
      pass: passId,
      description: `Partition complete. Pivot is now locked at index ${pi}.`,
      nextHint: `quick_sort will now recursively sort the left and right halves.`,
      vars: {
        low: { value: low, type: "int" },
        high: { value: high, type: "int" },
        pivot: { value: pivot, type: "int" },
      },
      counters: { comparisons, swaps },
      pointers: [
        { index: pi, label: "pivot_idx", color: "purple" },
      ],
    });

    return pi;
  }

  qs(0, n - 1);

  // Done
  push({
    highlights: buildHighlights(n, sortedIndices),
    line: 6,
    kind: "done",
    description: `Sorted: [${arr.join(", ")}]. Total: ${comparisons} comparisons, ${swaps} swaps.`,
    nextHint: "Execution finished.",
    vars: { result: { value: `[${arr.join(", ")}]`, type: "list", changed: true } },
    counters: { comparisons, swaps },
    pointers: [],
  });

  return steps;
}

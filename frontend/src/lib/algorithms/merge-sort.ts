import type { AlgorithmMeta, VisualizationStep, VariableValue, HighlightState } from "@/types/visualization";
import { buildHighlights } from "./utils";

export const mergeSortMeta: AlgorithmMeta = {
  id: "merge-sort",
  name: "Merge Sort",
  category: "Sorting",
  description:
    "A divide and conquer algorithm that divides the array into halves, recursively sorts them, and merges the sorted halves.",
  timeComplexity: { best: "Ω(n log n)", average: "Θ(n log n)", worst: "O(n log n)" },
  spaceComplexity: "O(n)",
  stable: true,
  language: "python",
  codeLines: [
    "def merge_sort(arr, l, r):",
    "    if l < r:",
    "        m = l + (r - l) // 2",
    "        merge_sort(arr, l, m)",
    "        merge_sort(arr, m + 1, r)",
    "        merge(arr, l, m, r)",
    "    return arr",
    "",
    "def merge(arr, l, m, r):",
    "    left = arr[l:m+1]",
    "    right = arr[m+1:r+1]",
    "    i = 0",
    "    j = 0",
    "    k = l",
    "    while i < len(left) and j < len(right):",
    "        if left[i] <= right[j]:",
    "            arr[k] = left[i]",
    "            i += 1",
    "        else:",
    "            arr[k] = right[j]",
    "            j += 1",
    "        k += 1",
    "    while i < len(left):",
    "        arr[k] = left[i]",
    "        i += 1",
    "        k += 1",
    "    while j < len(right):",
    "        arr[k] = right[j]",
    "        j += 1",
    "        k += 1",
  ],
};

export function generateMergeSortSteps(input: number[]): VisualizationStep[] {
  const arr = [...input];
  const n = arr.length;
  const steps: VisualizationStep[] = [];
  let comparisons = 0;
  let copies = 0;
  let sortedIndices = new Set<number>();

  type Vars = Record<string, VariableValue>;
  const push = (step: Omit<VisualizationStep, "data">) =>
    steps.push({ ...step, data: [...arr] });

  push({
    highlights: buildHighlights(n, sortedIndices),
    line: 1,
    kind: "pass",
    description: `Calling merge_sort() with array of ${n} elements.`,
    nextHint: `Starting initial call with l=0, r=${n - 1}.`,
    vars: {},
    counters: { comparisons, copies },
    pointers: [],
  });

  function ms(l: number, r: number, depth: number) {
    const isBaseCase = l >= r;
    const range = { low: l, high: r };
    const activeRuns = [{ start: l, end: r, color: "#22d3ee" }];

    if (isBaseCase) {
      push({
        highlights: buildHighlights(n, sortedIndices, { [l]: "sorted" }, range),
        depth,
        runs: activeRuns,
        line: 2,
        kind: "pass",
        description: `arr[${l}] is a single element \u2192 already sorted`,
        nextHint: `Returning to parent call.`,
        vars: { l: { value: l, type: "int" }, r: { value: r, type: "int" } },
        counters: { comparisons, copies },
        pointers: [],
      });
      return;
    }

    const m = Math.floor(l + (r - l) / 2);

    push({
      highlights: buildHighlights(n, sortedIndices, {}, range),
      depth,
      runs: activeRuns,
      line: 3,
      kind: "pass",
      description: `split arr[${l}..${r}] at mid = ${m}`,
      nextHint: `Recursively sorting left half.`,
      vars: { l: { value: l, type: "int" }, r: { value: r, type: "int" }, m: { value: m, type: "int" } },
      counters: { comparisons, copies },
      pointers: [],
    });

    push({
      highlights: buildHighlights(n, sortedIndices, {}, range),
      depth,
      runs: [{ start: l, end: m, color: "#22d3ee" }],
      line: 4,
      kind: "pass",
      description: `recurse left \u2192 sort(arr, ${l}, ${m})`,
      nextHint: `Diving deeper into left half.`,
      vars: { l: { value: l, type: "int" }, r: { value: r, type: "int" }, m: { value: m, type: "int" } },
      counters: { comparisons, copies },
      pointers: [],
    });
    ms(l, m, depth + 1);

    push({
      highlights: buildHighlights(n, sortedIndices, {}, range),
      depth,
      runs: [{ start: m + 1, end: r, color: "#facc15" }],
      line: 5,
      kind: "pass",
      description: `recurse right \u2192 sort(arr, ${m + 1}, ${r})`,
      nextHint: `Diving deeper into right half.`,
      vars: { l: { value: l, type: "int" }, r: { value: r, type: "int" }, m: { value: m, type: "int" } },
      counters: { comparisons, copies },
      pointers: [],
    });
    ms(m + 1, r, depth + 1);

    merge(l, m, r, depth);
  }

  function merge(l: number, m: number, r: number, depth: number) {
    const left = arr.slice(l, m + 1);
    const right = arr.slice(m + 1, r + 1);
    const range = { low: l, high: r };
    const tempData: { value: number; index: number; originalIndex: number }[] = [];
    const hiddenIndices: Record<number, HighlightState> = {};
    const mergeRuns = [
      { start: l, end: m, color: "#22d3ee" },
      { start: m + 1, end: r, color: "#facc15" }
    ];
    const tempLine = { start: l, end: r };

    push({
      highlights: buildHighlights(n, sortedIndices, {}, range),
      depth,
      runs: mergeRuns,
      tempLine,
      line: 10,
      kind: "pass",
      description: `merge arr[${l}..${m}] and arr[${m + 1}..${r}]`,
      nextHint: `Comparing and merging elements.`,
      vars: { l: { value: l, type: "int" }, m: { value: m, type: "int" }, r: { value: r, type: "int" } },
      counters: { comparisons, copies },
      pointers: [],
    });

    let i = 0;
    let j = 0;
    let k = l;

    const getPointers = () => [
      ...(i < left.length ? [{ index: l + i, label: "i", color: "cyan" as const }] : []),
      ...(j < right.length ? [{ index: m + 1 + j, label: "j", color: "amber" as const }] : []),
    ];

    while (i < left.length && j < right.length) {
      comparisons++;
      const valL = left[i];
      const valR = right[j];
      const isLessEqual = valL <= valR;

      push({
        highlights: buildHighlights(n, sortedIndices, { ...hiddenIndices, [l + i]: "compare", [m + 1 + j]: "compare" }, range),
        tempData: [...tempData],
        depth,
        runs: mergeRuns,
        tempLine,
        line: 16,
        kind: "compare",
        comparisonText: `<span class="text-viz-compare-left">${valL}</span> <span class="text-muted-foreground/80">${isLessEqual ? '\u2264' : '>'}</span> <span class="text-viz-compare-right">${valR}</span> <span class="text-muted-foreground">?</span>`,
        description: isLessEqual ? `${valL} \u2264 ${valR} ?` : `${valL} > ${valR} \u2192 take ${valR} from the right run`,
        nextHint: `Taking smaller element.`,
        vars: { i: { value: i, type: "int" }, j: { value: j, type: "int" }, k: { value: k, type: "int" } },
        counters: { comparisons, copies },
        pointers: getPointers(),
      });

      if (isLessEqual) {
        tempData.push({ value: left[i], index: k, originalIndex: l + i });
        hiddenIndices[l + i] = "hidden";
        copies++;

        push({
          highlights: buildHighlights(n, sortedIndices, hiddenIndices, range),
          tempData: [...tempData],
          depth,
          runs: mergeRuns,
          tempLine,
          line: 17,
          kind: "swap",
          description: `${valL} \u2264 ${valR} \u2192 take ${valL} from the left run`,
          nextHint: `Incrementing i and k.`,
          vars: { i: { value: i, type: "int" }, j: { value: j, type: "int" }, k: { value: k, type: "int" } },
          counters: { comparisons, copies },
          pointers: getPointers(),
        });
        i++;
      } else {
        tempData.push({ value: right[j], index: k, originalIndex: m + 1 + j });
        hiddenIndices[m + 1 + j] = "hidden";
        copies++;

        push({
          highlights: buildHighlights(n, sortedIndices, hiddenIndices, range),
          tempData: [...tempData],
          depth,
          runs: mergeRuns,
          tempLine,
          line: 20,
          kind: "swap",
          description: `${valL} > ${valR} \u2192 take ${valR} from the right run`,
          nextHint: `Incrementing j and k.`,
          vars: { i: { value: i, type: "int" }, j: { value: j, type: "int" }, k: { value: k, type: "int" } },
          counters: { comparisons, copies },
          pointers: getPointers(),
        });
        j++;
      }
      k++;
    }

    while (i < left.length) {
      tempData.push({ value: left[i], index: k, originalIndex: l + i });
      hiddenIndices[l + i] = "hidden";
      copies++;
      push({
        highlights: buildHighlights(n, sortedIndices, hiddenIndices, range),
        tempData: [...tempData],
        depth,
        runs: mergeRuns,
        tempLine,
        line: 24,
        kind: "swap",
        description: `right run empty \u2192 copy ${left[i]} across`,
        nextHint: `Incrementing i and k.`,
        vars: { i: { value: i, type: "int" }, k: { value: k, type: "int" } },
        counters: { comparisons, copies },
        pointers: getPointers(),
      });
      i++;
      k++;
    }

    while (j < right.length) {
      tempData.push({ value: right[j], index: k, originalIndex: m + 1 + j });
      hiddenIndices[m + 1 + j] = "hidden";
      copies++;
      push({
        highlights: buildHighlights(n, sortedIndices, hiddenIndices, range),
        tempData: [...tempData],
        depth,
        runs: mergeRuns,
        tempLine,
        line: 28,
        kind: "swap",
        description: `left run empty \u2192 copy ${right[j]} across`,
        nextHint: `Incrementing j and k.`,
        vars: { j: { value: j, type: "int" }, k: { value: k, type: "int" } },
        counters: { comparisons, copies },
        pointers: getPointers(),
      });
      j++;
      k++;
    }

    for (const item of tempData) {
      arr[item.index] = item.value;
    }

    push({
      highlights: buildHighlights(n, sortedIndices, {}, range),
      depth,
      runs: [{ start: l, end: r, color: "#00d084" }],
      line: 6,
      kind: "pass",
      description: `arr[${l}..${r}] is now a sorted run`,
      nextHint: `Merge step complete.`,
      vars: { l: { value: l, type: "int" }, m: { value: m, type: "int" }, r: { value: r, type: "int" } },
      counters: { comparisons, copies },
      pointers: [],
    });

    if (l === 0 && r === n - 1) {
      for (let x = 0; x < n; x++) sortedIndices.add(x);
    }
  }

  ms(0, n - 1, 1);

  push({
    highlights: buildHighlights(n, sortedIndices),
    line: 7,
    kind: "done",
    description: `Sorted: [${arr.join(", ")}]. Total: ${comparisons} comparisons, ${copies} copies.`,
    nextHint: "Execution finished.",
    vars: { result: { value: `[${arr.join(", ")}]`, type: "list", changed: true } },
    counters: { comparisons, copies },
    pointers: [],
  });

  return steps;
}

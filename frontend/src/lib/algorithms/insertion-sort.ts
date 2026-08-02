import type { AlgorithmMeta, VisualizationStep, VariableValue } from "@/types/visualization";
import { buildHighlights } from "./utils";

export const insertionSortMeta: AlgorithmMeta = {
  id: "insertion-sort",
  name: "Insertion Sort",
  category: "Sorting",
  description:
    "Builds the final sorted array one item at a time, by repeatedly taking the next element and inserting it into its correct position.",
  timeComplexity: { best: "Ω(n)", average: "Θ(n²)", worst: "O(n²)" },
  spaceComplexity: "O(1)",
  stable: true,
  language: "python",
  codeLines: [
    "def insertion_sort(arr):",
    "    n = len(arr)",
    "    for i in range(1, n):",
    "        key = arr[i]",
    "        j = i - 1",
    "        while j >= 0 and arr[j] > key:",
    "            arr[j + 1] = arr[j]",
    "            j -= 1",
    "        arr[j + 1] = key",
    "    return arr",
  ],
};

export function generateInsertionSortSteps(input: number[]): VisualizationStep[] {
  const arr = [...input];
  const n = arr.length;
  const steps: VisualizationStep[] = [];
  let comparisons = 0;
  let swaps = 0; // insertion sort does shifts, we can count them as swaps or just shifts
  let sortedIndices = new Set<number>();
  
  // Initially, the first element is trivially sorted
  if (n > 0) sortedIndices.add(0);

  type Vars = Record<string, VariableValue>;
  const push = (step: Omit<VisualizationStep, "data">) =>
    steps.push({ ...step, data: [...arr] });

  push({
    highlights: buildHighlights(n, sortedIndices),
    line: 1,
    kind: "pass",
    description: `Calling insertion_sort() with array of ${n} elements.`,
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
    nextHint: "The loop starts from index 1 since index 0 is trivially sorted.",
    vars: { n: { value: n, type: "int", changed: true } },
    counters: { comparisons, swaps },
    pointers: [],
  });

  for (let i = 1; i < n; i++) {
    const passNum = i;
    
    push({
      highlights: buildHighlights(n, sortedIndices),
      line: 3,
      kind: "pass",
      pass: passNum,
      description: `Outer loop iteration i = ${i}.`,
      nextHint: `Extracting element at index ${i} to use as key.`,
      vars: {
        n: { value: n, type: "int" },
        i: { value: i, type: "int", changed: true },
      },
      counters: { comparisons, swaps },
      pointers: [{ index: i, label: "i", color: "amber" }],
    });

    let key = arr[i];

    push({
      highlights: buildHighlights(n, sortedIndices, { [i]: "key" }),
      line: 4,
      kind: "pass",
      pass: passNum,
      description: `Stored key = ${key}. This creates an empty slot at index ${i}.`,
      nextHint: `Setting j to point to the end of the sorted sub-array.`,
      vars: {
        n: { value: n, type: "int" },
        i: { value: i, type: "int" },
        key: { value: key, type: "int", changed: true },
      },
      counters: { comparisons, swaps },
      pointers: [{ index: i, label: "i", color: "amber" }],
    });

    let j = i - 1;

    push({
      highlights: buildHighlights(n, sortedIndices, { [i]: "key" }),
      line: 5,
      kind: "pass",
      pass: passNum,
      description: `Set j = ${j}.`,
      nextHint: `Will repeatedly compare arr[j] with key to find the correct insertion point.`,
      vars: {
        n: { value: n, type: "int" },
        i: { value: i, type: "int" },
        key: { value: key, type: "int" },
        j: { value: j, type: "int", changed: true },
      },
      counters: { comparisons, swaps },
      pointers: [
        { index: i, label: "i", color: "amber" },
        { index: j, label: "j", color: "cyan" }
      ],
    });

    let slot = i;

    while (true) {
      if (j < 0) {
        push({
          highlights: buildHighlights(n, sortedIndices, { [slot]: "key" }),
          line: 6,
          kind: "pass",
          pass: passNum,
          description: `j < 0, reached the beginning of the array.`,
          nextHint: `Loop terminates. Ready to insert key.`,
          vars: {
            n: { value: n, type: "int" },
            i: { value: i, type: "int" },
            key: { value: key, type: "int" },
            j: { value: j, type: "int" },
          },
          counters: { comparisons, swaps },
          pointers: [
            { index: i, label: "i", color: "amber" }
          ],
        });
        break;
      }

      comparisons++;
      const val = arr[j];
      const isGreater = val > key;

      const compareVars: Vars = {
        n: { value: n, type: "int" },
        i: { value: i, type: "int" },
        key: { value: key, type: "int" },
        j: { value: j, type: "int" },
        "arr[j]": { value: val, type: "int", changed: true },
      };

      const comparisonText = `<span class="text-viz-compare-left">${val}</span> <span class="text-muted-foreground/80">&gt;</span> <span class="text-viz-pivot">${key}</span> <span class="text-muted-foreground">?</span>`;

      push({
        highlights: buildHighlights(n, sortedIndices, { [j]: "compare", [slot]: "key" }),
        line: 6,
        kind: "compare",
        pass: passNum,
        comparisonText,
        description: `Checking condition: j >= 0 (${j} >= 0) AND arr[${j}] > key (${val} > ${key}) — ${isGreater ? "TRUE" : "FALSE"}.`,
        nextHint: isGreater
          ? `arr[${j}] is greater than key. It must be shifted right.`
          : `arr[${j}] is not greater than key. Loop terminates.`,
        vars: compareVars,
        counters: { comparisons, swaps },
        pointers: [
          { index: i, label: "i", color: "amber" },
          { index: j, label: "j", color: "cyan" }
        ],
      });

      if (!isGreater) break;

      let temp = arr[j + 1];
      arr[j + 1] = arr[j];
      arr[j] = temp;
      swaps++;
      slot = j; // slot moves left

      push({
        highlights: buildHighlights(n, sortedIndices, { [j + 1]: "swap", [j]: "key" }),
        line: 7,
        kind: "swap",
        pass: passNum,
        description: `Shifted arr[${j}] to arr[${j + 1}].`,
        nextHint: `Decrementing j to check the next element.`,
        vars: {
          n: { value: n, type: "int" },
          i: { value: i, type: "int" },
          key: { value: key, type: "int" },
          j: { value: j, type: "int" },
          "arr[j+1]": { value: arr[j + 1], type: "int", changed: true },
        },
        counters: { comparisons, swaps },
        pointers: [
          { index: i, label: "i", color: "amber" },
          { index: j, label: "j", color: "cyan" }
        ],
      });

      j -= 1;

      push({
        highlights: buildHighlights(n, sortedIndices, { [slot]: "key" }),
        line: 8,
        kind: "pass",
        pass: passNum,
        description: `Decremented j to ${j}.`,
        nextHint: `Looping back to evaluate condition again.`,
        vars: {
          n: { value: n, type: "int" },
          i: { value: i, type: "int" },
          key: { value: key, type: "int" },
          j: { value: j, type: "int", changed: true },
        },
        counters: { comparisons, swaps },
        pointers: j >= 0 ? [
          { index: i, label: "i", color: "amber" },
          { index: j, label: "j", color: "cyan" }
        ] : [
          { index: i, label: "i", color: "amber" }
        ],
      });
    }

    arr[j + 1] = key;
    sortedIndices.add(i);

    push({
      highlights: buildHighlights(n, sortedIndices, { [j + 1]: "sorted" }),
      line: 9,
      kind: "insert",
      pass: passNum,
      comparisonText: `<span class="text-viz-pivot font-bold">insert</span> <span class="text-viz-pivot">${key}</span> <span class="text-muted-foreground">→</span> <span class="text-foreground">arr[${j + 1}]</span>`,
      description: `Inserted key (${key}) into arr[${j + 1}].`,
      nextHint: `The sub-array 0...${i} is now sorted.`,
      vars: {
        n: { value: n, type: "int" },
        i: { value: i, type: "int" },
        key: { value: key, type: "int" },
        j: { value: j, type: "int" },
        [`arr[${j+1}]`]: { value: key, type: "int", changed: true },
      },
      counters: { comparisons, swaps },
      pointers: [],
    });
  }

  // Done
  push({
    highlights: buildHighlights(n, sortedIndices),
    line: 10,
    kind: "done",
    description: `Sorted: [${arr.join(", ")}]. Total: ${comparisons} comparisons, ${swaps} shifts.`,
    nextHint: "Execution finished.",
    vars: { n: { value: n, type: "int" }, result: { value: `[${arr.join(", ")}]`, type: "list", changed: true } },
    counters: { comparisons, swaps },
    pointers: [],
  });

  return steps;
}

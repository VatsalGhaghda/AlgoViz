import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const arrayCreateMeta: AlgorithmMeta = {
  id: "array-create",
  name: "Create Array",
  category: "Arrays",
  description: "Allocates contiguous memory and initializes an array with elements.",
  timeComplexity: {
    best: "Ω(n)",
    average: "Θ(n)",
    worst: "O(n)"
  },
  spaceComplexity: "O(n)",
  language: "python",
  codeLines: [
    "import random",
    "",
    "def create_random_array(n):",
    "    arr = [0] * n",
    "    for i in range(n):",
    "        arr[i] = random.randint(1, 100)",
    "    return arr"
  ],
};

export function generateArrayCreateSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;

  if (n === 0) return steps;

  // Track state
  const arr = new Array(n).fill(0);
  let i: number | string = "None";
  
  const v = (name: string, val: any, type: any) => {
    const prevVars = steps.length > 0 ? steps[steps.length - 1].vars : null;
    const isChanged = prevVars ? prevVars[name]?.value !== val : false;
    return { value: val, type, ...(isChanged ? { changed: true } : {}) };
  };

  const push = (
    line: number,
    description: string,
    nextHint: string,
    highlights: Record<number, HighlightState>,
    pointers: any[],
    overrideData?: number[]
  ) => {
    steps.push({
      data: overrideData ? [...overrideData] : [...arr],
      highlights,
      line,
      kind: "pass",
      description,
      nextHint,
      vars: {
        n: v("n", n, "int"),
        arr: v("arr", `[${arr.join(", ")}]`, "list"),
        i: v("i", i, "int"),
      },
      pointers,
    });
  };

  // Step 1: Initial call
  push(1, `create_random_array(${n}) called`, `Allocating contiguous memory for ${n} elements.`, {}, [], []);

  // Step 2: allocation
  push(4, `arr = [0] * ${n}`, `Memory allocated. Starting loop to populate array.`, {}, [], []);

  // Loop
  for (let idx = 0; idx < n; idx++) {
    i = idx;
    // Step 3: Loop start
    push(5, `for i = ${i}`, `Generating random value for arr[${i}].`, { [i]: "compare" }, [{ index: i, label: "i", color: "cyan" }]);

    arr[i] = input[i];

    // Step 4: Assignment
    push(6, `arr[${i}] = random.randint(1, 100) -> ${input[i]}`, `Moving to next element.`, { [i]: "active" }, [{ index: i, label: "i", color: "cyan" }]);
  }

  i = "None";
  // Step 5: Return
  push(7, `Array successfully populated.`, `Returning arr.`, {}, []);

  return steps;
}

import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const arrayTraverseMeta: AlgorithmMeta = {
  id: "array-traverse",
  name: "Traverse Array",
  category: "Arrays",
  description: "Iterates through each element in the array sequentially.",
  timeComplexity: {
    best: "Ω(n)",
    average: "Θ(n)",
    worst: "O(n)"
  },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def traverse_array(arr):",
    "    n = len(arr)",
    "    for i in range(n):",
    "        # Access arr[i]",
    "        print(arr[i])",
    "    return"
  ],
};

export function generateArrayTraverseSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  
  if (n === 0) return steps;

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
    pointers: any[]
  ) => {
    steps.push({
      data: [...input],
      highlights,
      line,
      kind: "pass",
      description,
      nextHint,
      vars: {
        arr: v("arr", `[${input.join(", ")}]`, "list"),
        n: v("n", n, "int"),
        i: v("i", i, "int"),
      },
      pointers,
    });
  };

  // Step 1: initial call
  push(1, `traverse_array(arr) called with ${n} elements.`, `Calculating length of array.`, {}, []);

  // Step 2: n
  push(2, `n = len(arr) -> ${n}`, `Starting loop from 0 to ${n-1}.`, {}, []);

  for (let idx = 0; idx < n; idx++) {
    i = idx;
    // Step 3: loop
    push(3, `for i = ${i}`, `Accessing element at index ${i}.`, { [i]: "compare" }, [{ index: i, label: "i", color: "cyan" }]);

    // Step 4: access
    push(4, `Access arr[${i}] -> ${input[i]}`, `Printing value.`, { [i]: "active" }, [{ index: i, label: "i", color: "cyan" }]);
    
    // Step 5: print
    push(5, `print(${input[i]})`, `Continuing to next iteration.`, { [i]: "sorted" }, [{ index: i, label: "i", color: "cyan" }]);
  }

  i = "None";
  // Step 6: return
  push(6, `Traversal complete.`, `Returning from function.`, {}, []);

  return steps;
}

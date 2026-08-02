import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const arrayAccessMeta: AlgorithmMeta = {
  id: "array-access",
  name: "Access by Index",
  category: "Arrays",
  description: "Directly accesses an element in the array using its index.",
  timeComplexity: {
    best: "Ω(1)",
    average: "Θ(1)",
    worst: "O(1)"
  },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def access_element(arr, index):",
    "    return arr[index]"
  ],
};

export function generateArrayAccessSteps(input: number[], target?: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  
  if (n === 0) return steps;

  const index = target !== undefined ? target : 0;
  let returnValue: number | string = "None";
  
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
        index: v("index", index, "int"),
        result: v("result", returnValue, "int"),
      },
      pointers,
    });
  };

  const pushError = () => {
    steps.push({
      data: [...input],
      highlights: {},
      line: 0,
      kind: "pass",
      description: "The entered index is not valid.",
      nextHint: `Please enter a valid index between 0 and ${n - 1}.`,
      vars: {
        arr: v("arr", `[${input.join(", ")}]`, "list"),
        index: v("index", index, "int"),
      },
      pointers: [],
    });
  };

  if (index < 0 || index >= n) {
    pushError();
    return steps;
  }

  // Step 1: initial call
  push(1, `access_element(arr, ${index}) called.`, `Accessing element.`, {}, []);

  // Step 2: access & return
  returnValue = input[index];
  push(2, `return arr[${index}] -> ${returnValue}`, `Function completes.`, { [index]: "found" }, [{ index: index, label: "index", color: "cyan" }]);

  return steps;
}

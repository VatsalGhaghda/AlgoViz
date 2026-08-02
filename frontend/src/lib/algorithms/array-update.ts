import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const arrayUpdateMeta: AlgorithmMeta = {
  id: "array-update",
  name: "Update Element",
  category: "Arrays",
  description: "Updates the value of an element at a specific index.",
  timeComplexity: {
    best: "Ω(1)",
    average: "Θ(1)",
    worst: "O(1)"
  },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def update_element(arr, index, new_value):",
    "    arr[index] = new_value",
    "    return arr"
  ],
};

export function generateArrayUpdateSteps(input: number[], target?: number, value?: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  const currentArray = [...input];
  
  if (n === 0) return steps;

  const index = target !== undefined ? target : 0;
  const newValue = value !== undefined ? value : 42;
  let returnValue: string = "None";
  
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
      data: [...currentArray],
      highlights,
      line,
      kind: "pass",
      description,
      nextHint,
      vars: {
        arr: v("arr", `[${currentArray.join(", ")}]`, "list"),
        index: v("index", index, "int"),
        new_value: v("new_value", newValue, "int"),
        result: v("result", returnValue, "list"),
      },
      pointers,
    });
  };

  const pushError = () => {
    steps.push({
      data: [...currentArray],
      highlights: {},
      line: 0,
      kind: "pass",
      description: "The entered index is not valid.",
      nextHint: `Please enter a valid index between 0 and ${n - 1}.`,
      vars: {
        arr: v("arr", `[${currentArray.join(", ")}]`, "list"),
        index: v("index", index, "int"),
        new_value: v("new_value", newValue, "int"),
      },
      pointers: [],
    });
  };

  if (index < 0 || index >= n) {
    pushError();
    return steps;
  }

  const pushValueError = () => {
    steps.push({
      data: [...currentArray],
      highlights: {},
      line: 0,
      kind: "pass",
      description: "The entered value is not valid.",
      nextHint: `Please enter a value between -1000 and 1000.`,
      vars: {
        arr: v("arr", `[${currentArray.join(", ")}]`, "list"),
        index: v("index", index, "int"),
        new_value: v("new_value", newValue, "int"),
      },
      pointers: [],
    });
  };

  if (newValue < -1000 || newValue > 1000) {
    pushValueError();
    return steps;
  }

  // Step 1: initial call
  push(1, `update_element(arr, ${index}, ${newValue}) called.`, `Preparing to overwrite.`, { [index]: "compare" }, [{ index: index, label: "index", color: "cyan" }]);

  currentArray[index] = newValue;
  // Step 2: assignment
  push(2, `arr[${index}] = ${newValue}`, `Memory slot updated.`, { [index]: "active" }, [{ index: index, label: "index", color: "amber" }]);

  returnValue = `[${currentArray.join(", ")}]`;
  // Step 3: return
  push(3, `return arr`, `Function completes.`, { [index]: "sorted" }, []);

  return steps;
}

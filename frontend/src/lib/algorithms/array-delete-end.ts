import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const arrayDeleteEndMeta: AlgorithmMeta = {
  id: "array-delete-end",
  name: "Delete at End",
  category: "Arrays",
  description: "Removes the last element from the array.",
  timeComplexity: { best: "Ω(1)", average: "Θ(1)", worst: "O(1)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def delete_at_end(arr):",
    "    if len(arr) == 0:",
    "        return arr",
    "    arr.pop()",
    "    return arr"
  ],
};

export function generateArrayDeleteEndSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  const currentArray = [...input];

  let returnValue: string = "None";

  const v = (name: string, value: any, type: any) => {
    const prevVars = steps.length > 0 ? steps[steps.length - 1].vars : null;
    const isChanged = prevVars ? prevVars[name]?.value !== value : false;
    return { value, type, ...(isChanged ? { changed: true } : {}) };
  };

  const push = (line: number, description: string, nextHint: string, highlights: Record<number, HighlightState>, pointers: any[]) => {
    steps.push({
      data: [...currentArray], highlights, line, kind: "pass", description, nextHint,
      vars: {
        arr: v("arr", `[${currentArray.join(", ")}]`, "list"),
        result: v("result", returnValue, "list"),
      },
      pointers,
    });
  };

  push(1, `delete_at_end(arr) called.`, `Checking if array is empty.`, {}, []);

  if (n === 0) {
    push(2, `if len(arr) == 0: True`, `Array is empty. Cannot delete.`, {}, []);
    returnValue = `[${currentArray.join(", ")}]`;
    push(3, `return arr`, `Function terminates.`, {}, []);
    return steps;
  }

  push(2, `if len(arr) == 0: False`, `Array has elements. Preparing to pop.`, {}, []);

  push(4, `arr.pop()`, `Removing the last element.`, { [n - 1]: "compare" }, [{ index: n - 1, label: "end", color: "amber" }]);
  
  currentArray.pop();
  
  returnValue = `[${currentArray.join(", ")}]`;
  push(5, `return arr`, `Function completes.`, {}, []);

  return steps;
}

import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const arrayDeleteBeginningMeta: AlgorithmMeta = {
  id: "array-delete-beginning",
  name: "Delete at Beginning",
  category: "Arrays",
  description: "Removes the first element, shifting all subsequent elements left.",
  timeComplexity: { best: "Ω(n)", average: "Θ(n)", worst: "O(n)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def delete_at_beginning(arr):",
    "    if len(arr) == 0:",
    "        return arr",
    "    for i in range(0, len(arr) - 1):",
    "        arr[i] = arr[i + 1]",
    "    arr.pop()",
    "    return arr"
  ],
};

export function generateArrayDeleteBeginningSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  const currentArray = [...input];

  let i: number | string = "None";
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
        i: v("i", i, "int"),
        result: v("result", returnValue, "list"),
      },
      pointers,
    });
  };

  push(1, `delete_at_beginning(arr) called.`, `Checking if array is empty.`, {}, []);

  if (n === 0) {
    push(2, `if len(arr) == 0: True`, `Array is empty. Cannot delete.`, {}, []);
    returnValue = `[${currentArray.join(", ")}]`;
    push(3, `return arr`, `Function terminates.`, {}, []);
    return steps;
  }

  push(2, `if len(arr) == 0: False`, `Array has elements. Preparing to shift left.`, {}, []);

  for (let idx = 0; idx < n - 1; idx++) {
    i = idx;
    push(4, `for i = ${i}`, `Preparing to shift element left.`, { [i]: "compare", [i + 1]: "compare" }, [
      { index: i, label: "i", color: "cyan" },
      { index: i + 1, label: "i+1", color: "purple" }
    ]);
    
    currentArray[i] = currentArray[i + 1];
    push(5, `arr[${i}] = arr[${i + 1}]`, `Value shifted.`, { [i]: "active", [i + 1]: "idle" }, [
      { index: i, label: "i", color: "amber" },
      { index: i + 1, label: "i+1", color: "purple" }
    ]);
  }

  i = "None";
  push(6, `arr.pop()`, `Removing the now-duplicate last element.`, { [n - 1]: "compare" }, [{ index: n - 1, label: "end", color: "amber" }]);
  
  currentArray.pop();
  
  returnValue = `[${currentArray.join(", ")}]`;
  push(7, `return arr`, `Function completes.`, {}, []);

  return steps;
}

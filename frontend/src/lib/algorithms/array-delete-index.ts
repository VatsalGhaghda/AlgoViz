import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const arrayDeleteIndexMeta: AlgorithmMeta = {
  id: "array-delete-index",
  name: "Delete at Index",
  category: "Arrays",
  description: "Removes an element at a specific index, shifting subsequent elements left.",
  timeComplexity: { best: "Ω(n)", average: "Θ(n)", worst: "O(n)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def delete_at_index(arr, index):",
    "    if len(arr) == 0:",
    "        return arr",
    "    for i in range(index, len(arr) - 1):",
    "        arr[i] = arr[i + 1]",
    "    arr.pop()",
    "    return arr"
  ],
};

export function generateArrayDeleteIndexSteps(input: number[], target?: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  const currentArray = [...input];

  const index = target !== undefined ? target : Math.floor(n / 2);

  let i: number | string = "None";
  let returnValue: string = "None";

  const v = (name: string, value: any, type: any) => {
    const prevVars = steps.length > 0 ? steps[steps.length - 1].vars : null;
    const isChanged = prevVars ? prevVars[name]?.value !== value : false;
    return { value, type, ...(isChanged ? { changed: true } : {}) };
  };

  const pushError = (msg: string, hint: string) => {
    steps.push({
      data: [...currentArray], highlights: {}, line: 0, kind: "pass",
      description: msg, nextHint: hint,
      vars: { arr: v("arr", `[${currentArray.join(", ")}]`, "list"), index: v("index", index, "int") },
      pointers: []
    });
  };

  if (index < 0 || index >= n) {
    pushError("The entered index is not valid.", `Please enter a valid index between 0 and ${n - 1}.`);
    return steps;
  }

  const push = (line: number, description: string, nextHint: string, highlights: Record<number, HighlightState>, pointers: any[]) => {
    steps.push({
      data: [...currentArray], highlights, line, kind: "pass", description, nextHint,
      vars: {
        arr: v("arr", `[${currentArray.join(", ")}]`, "list"),
        index: v("index", index, "int"),
        i: v("i", i, "int"),
        result: v("result", returnValue, "list"),
      },
      pointers,
    });
  };

  push(1, `delete_at_index(arr, ${index}) called.`, `Checking if array is empty.`, {}, []);

  if (n === 0) {
    push(2, `if len(arr) == 0: True`, `Array is empty. Cannot delete.`, {}, []);
    returnValue = `[${currentArray.join(", ")}]`;
    push(3, `return arr`, `Function terminates.`, {}, []);
    return steps;
  }

  push(2, `if len(arr) == 0: False`, `Array has elements. Preparing to shift left.`, {}, []);

  for (let idx = index; idx < n - 1; idx++) {
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

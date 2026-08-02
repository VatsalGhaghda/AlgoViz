import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const arrayFindMinMeta: AlgorithmMeta = {
  id: "array-find-min",
  name: "Find Minimum",
  category: "Arrays",
  description: "Finds the minimum element in the array.",
  timeComplexity: { best: "Ω(n)", average: "Θ(n)", worst: "O(n)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def find_min(arr):",
    "    if len(arr) == 0:",
    "        return None",
    "    min_val = arr[0]",
    "    for i in range(1, len(arr)):",
    "        if arr[i] < min_val:",
    "            min_val = arr[i]",
    "    return min_val"
  ],
};

export function generateArrayFindMinSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  const currentArray = [...input];

  let minVal: number | string = "None";
  let i: number | string = "None";
  let returnValue: number | string = "None";

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
        min_val: v("min_val", minVal, "int"),
        i: v("i", i, "int"),
        result: v("result", returnValue, "int"),
      },
      pointers,
    });
  };

  push(1, `find_min(arr) called.`, `Checking if array is empty.`, {}, []);

  if (n === 0) {
    push(2, `if len(arr) == 0: True`, `Array is empty.`, {}, []);
    returnValue = "None";
    push(3, `return None`, `Cannot find min of empty array.`, {}, []);
    return steps;
  }
  push(2, `if len(arr) == 0: False`, `Array is not empty.`, {}, []);

  minVal = currentArray[0];
  let minIdx = 0;
  push(4, `min_val = arr[0] (${minVal})`, `Initialize min_val with the first element.`, { 0: "active" }, [{ index: 0, label: "min", color: "emerald" }]);

  for (let idx = 1; idx < n; idx++) {
    i = idx;
    push(5, `for i = ${i}`, `Move to next element.`, { [i]: "compare", [minIdx]: "active" }, [
      { index: minIdx, label: "min", color: "emerald" },
      { index: i, label: "i", color: "cyan" }
    ]);
    
    push(6, `if arr[${i}] < min_val: ${currentArray[i]} < ${minVal}`, `Comparing current element with min_val.`, { [i]: "compare", [minIdx]: "active" }, [
      { index: minIdx, label: "min", color: "emerald" },
      { index: i, label: "i", color: "cyan" }
    ]);

    if (currentArray[i] < (minVal as number)) {
      minVal = currentArray[i];
      minIdx = i;
      push(7, `min_val = ${minVal}`, `Found a new minimum! Update min_val.`, { [i]: "active" }, [
        { index: minIdx, label: "min", color: "emerald" },
        { index: i, label: "i", color: "cyan" }
      ]);
    }
  }

  i = "None";
  returnValue = minVal;
  push(8, `return min_val (${minVal})`, `Function completes.`, { [minIdx]: "found" }, [{ index: minIdx, label: "min", color: "emerald" }]);

  return steps;
}

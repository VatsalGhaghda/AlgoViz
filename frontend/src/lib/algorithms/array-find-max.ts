import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const arrayFindMaxMeta: AlgorithmMeta = {
  id: "array-find-max",
  name: "Find Maximum",
  category: "Arrays",
  description: "Finds the maximum element in the array.",
  timeComplexity: { best: "Ω(n)", average: "Θ(n)", worst: "O(n)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def find_max(arr):",
    "    if len(arr) == 0:",
    "        return None",
    "    max_val = arr[0]",
    "    for i in range(1, len(arr)):",
    "        if arr[i] > max_val:",
    "            max_val = arr[i]",
    "    return max_val"
  ],
};

export function generateArrayFindMaxSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  const currentArray = [...input];

  let maxVal: number | string = "None";
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
        max_val: v("max_val", maxVal, "int"),
        i: v("i", i, "int"),
        result: v("result", returnValue, "int"),
      },
      pointers,
    });
  };

  push(1, `find_max(arr) called.`, `Checking if array is empty.`, {}, []);

  if (n === 0) {
    push(2, `if len(arr) == 0: True`, `Array is empty.`, {}, []);
    returnValue = "None";
    push(3, `return None`, `Cannot find max of empty array.`, {}, []);
    return steps;
  }
  push(2, `if len(arr) == 0: False`, `Array is not empty.`, {}, []);

  maxVal = currentArray[0];
  let maxIdx = 0;
  push(4, `max_val = arr[0] (${maxVal})`, `Initialize max_val with the first element.`, { 0: "active" }, [{ index: 0, label: "max", color: "emerald" }]);

  for (let idx = 1; idx < n; idx++) {
    i = idx;
    push(5, `for i = ${i}`, `Move to next element.`, { [i]: "compare", [maxIdx]: "active" }, [
      { index: maxIdx, label: "max", color: "emerald" },
      { index: i, label: "i", color: "cyan" }
    ]);
    
    push(6, `if arr[${i}] > max_val: ${currentArray[i]} > ${maxVal}`, `Comparing current element with max_val.`, { [i]: "compare", [maxIdx]: "active" }, [
      { index: maxIdx, label: "max", color: "emerald" },
      { index: i, label: "i", color: "cyan" }
    ]);

    if (currentArray[i] > (maxVal as number)) {
      maxVal = currentArray[i];
      maxIdx = i;
      push(7, `max_val = ${maxVal}`, `Found a new maximum! Update max_val.`, { [i]: "active" }, [
        { index: maxIdx, label: "max", color: "emerald" },
        { index: i, label: "i", color: "cyan" }
      ]);
    }
  }

  i = "None";
  returnValue = maxVal;
  push(8, `return max_val (${maxVal})`, `Function completes.`, { [maxIdx]: "found" }, [{ index: maxIdx, label: "max", color: "emerald" }]);

  return steps;
}

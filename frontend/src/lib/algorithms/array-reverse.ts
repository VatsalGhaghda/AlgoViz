import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const arrayReverseMeta: AlgorithmMeta = {
  id: "array-reverse",
  name: "Reverse",
  category: "Arrays",
  description: "Reverses the elements of the array in-place.",
  timeComplexity: { best: "Ω(n)", average: "Θ(n)", worst: "O(n)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def reverse_array(arr):",
    "    left = 0",
    "    right = len(arr) - 1",
    "    while left < right:",
    "        arr[left], arr[right] = arr[right], arr[left]",
    "        left += 1",
    "        right -= 1",
    "    return arr"
  ],
};

export function generateArrayReverseSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  const currentArray = [...input];
  const boxIds = input.map((_, i) => `id-${i}`);

  let left: number | string = "None";
  let right: number | string = "None";
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
        left: v("left", left, "int"),
        right: v("right", right, "int"),
        result: v("result", returnValue, "list"),
      },
      pointers,
      boxIds: [...boxIds],
    });
  };

  push(1, `reverse_array(arr) called.`, `Initializing pointers.`, {}, []);

  if (n === 0) {
    returnValue = `[${currentArray.join(", ")}]`;
    push(8, `return arr`, `Array is empty.`, {}, []);
    return steps;
  }

  left = 0;
  push(2, `left = 0`, `Set left pointer to start of array.`, { [left]: "compare" }, [{ index: left, label: "left", color: "cyan" }]);

  right = n - 1;
  push(3, `right = ${n - 1}`, `Set right pointer to end of array.`, { [left]: "compare", [right]: "compare" }, [
    { index: left, label: "left", color: "cyan" },
    { index: right, label: "right", color: "purple" }
  ]);

  while (left < right) {
    push(4, `while ${left} < ${right}: True`, `Pointers have not crossed.`, { [left]: "compare", [right]: "compare" }, [
      { index: left, label: "left", color: "cyan" },
      { index: right, label: "right", color: "purple" }
    ]);

    push(5, `arr[${left}], arr[${right}] = arr[${right}], arr[${left}]`, `Swapping elements at left and right.`, { [left]: "swap", [right]: "swap" }, [
      { index: left, label: "left", color: "cyan" },
      { index: right, label: "right", color: "purple" }
    ]);
    
    // Perform swap
    const temp = currentArray[left];
    currentArray[left] = currentArray[right];
    currentArray[right] = temp;
    
    const tempId = boxIds[left];
    boxIds[left] = boxIds[right];
    boxIds[right] = tempId;
    
    push(5, `arr[${left}], arr[${right}] = arr[${right}], arr[${left}]`, `Elements swapped.`, { [left]: "active", [right]: "active" }, [
      { index: left, label: "left", color: "cyan" },
      { index: right, label: "right", color: "purple" }
    ]);

    left++;
    push(6, `left += 1`, `Move left pointer one step right.`, { [left]: "compare", [right]: "compare" }, [
      { index: left, label: "left", color: "cyan" },
      { index: right, label: "right", color: "purple" }
    ]);

    right--;
    push(7, `right -= 1`, `Move right pointer one step left.`, { [left]: "compare", [right]: "compare" }, [
      { index: left, label: "left", color: "cyan" },
      { index: right, label: "right", color: "purple" }
    ]);
  }

  push(4, `while ${left} < ${right}: False`, `Pointers crossed. Array is reversed.`, {}, []);

  left = "None";
  right = "None";
  returnValue = `[${currentArray.join(", ")}]`;
  push(8, `return arr`, `Function completes.`, {}, []);

  return steps;
}

import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const arrayInsertBeginningMeta: AlgorithmMeta = {
  id: "array-insert-beginning",
  name: "Insert at Beginning",
  category: "Arrays",
  description: "Inserts a new element at the beginning, shifting all existing elements right.",
  timeComplexity: { best: "Ω(n)", average: "Θ(n)", worst: "O(n)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def insert_at_beginning(arr, val):",
    "    arr.append(0)",
    "    for i in range(len(arr) - 1, 0, -1):",
    "        arr[i] = arr[i - 1]",
    "    arr[0] = val",
    "    return arr"
  ],
};

export function generateArrayInsertBeginningSteps(input: number[], target?: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  const currentArray = [...input];
  const val = target !== undefined ? target : 99;

  let i: number | string = "None";

  const v = (name: string, value: any, type: any) => {
    const prevVars = steps.length > 0 ? steps[steps.length - 1].vars : null;
    const isChanged = prevVars ? prevVars[name]?.value !== value : false;
    return { value, type, ...(isChanged ? { changed: true } : {}) };
  };

  if (val < -1000 || val > 1000) {
    steps.push({
      data: [...currentArray], highlights: {}, line: 0, kind: "pass",
      description: "The entered value is not valid.",
      nextHint: `Please enter a value between -1000 and 1000.`,
      vars: { arr: v("arr", `[${currentArray.join(", ")}]`, "list"), val: v("val", val, "int") },
      pointers: []
    });
    return steps;
  }

  const push = (line: number, description: string, nextHint: string, highlights: Record<number, HighlightState>, pointers: any[]) => {
    steps.push({
      data: [...currentArray], highlights, line, kind: "pass", description, nextHint,
      vars: {
        arr: v("arr", `[${currentArray.join(", ")}]`, "list"),
        val: v("val", val, "int"),
        i: v("i", i, "int"),
      },
      pointers,
    });
  };

  push(1, `insert_at_beginning(arr, ${val}) called.`, `Expanding array by 1.`, {}, []);

  currentArray.push(0);
  push(2, `arr.append(0)`, `Allocated a new slot initialized to 0.`, { [n]: "compare" }, []);

  for (let idx = n; idx > 0; idx--) {
    i = idx;
    push(3, `for i = ${i}`, `Preparing to shift element right.`, { [i]: "compare", [i - 1]: "compare" }, [
      { index: i, label: "i", color: "cyan" },
      { index: i - 1, label: "i-1", color: "purple" }
    ]);
    
    currentArray[i] = currentArray[i - 1];
    push(4, `arr[${i}] = arr[${i - 1}]`, `Value shifted.`, { [i]: "active", [i - 1]: "idle" }, [
      { index: i, label: "i", color: "amber" },
      { index: i - 1, label: "i-1", color: "purple" }
    ]);
  }

  i = "None";
  push(5, `arr[0] = ${val}`, `Inserting the new value at index 0.`, { [0]: "compare" }, [{ index: 0, label: "0", color: "purple" }]);
  
  currentArray[0] = val;
  push(5, `arr[0] = ${val}`, `New value inserted.`, { [0]: "active" }, [{ index: 0, label: "0", color: "purple" }]);

  push(6, `return arr`, `Function completes.`, {}, []);

  return steps;
}

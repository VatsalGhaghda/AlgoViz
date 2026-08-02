import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const arrayInsertIndexMeta: AlgorithmMeta = {
  id: "array-insert-index",
  name: "Insert at Index",
  category: "Arrays",
  description: "Inserts a new element at a specific index, shifting subsequent elements right.",
  timeComplexity: { best: "Ω(n)", average: "Θ(n)", worst: "O(n)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def insert_at_index(arr, index, val):",
    "    arr.append(0)",
    "    for i in range(len(arr) - 1, index, -1):",
    "        arr[i] = arr[i - 1]",
    "    arr[index] = val",
    "    return arr"
  ],
};

export function generateArrayInsertIndexSteps(input: number[], target?: number, value?: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  const currentArray = [...input];

  const index = target !== undefined ? target : Math.floor(n / 2);
  const val = value !== undefined ? value : 99;

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
      vars: { arr: v("arr", `[${currentArray.join(", ")}]`, "list"), index: v("index", index, "int"), val: v("val", val, "int") },
      pointers: []
    });
  };

  if (index < 0 || index > n) {
    pushError("The entered index is not valid.", `Please enter a valid index between 0 and ${n}.`);
    return steps;
  }
  if (val < -1000 || val > 1000) {
    pushError("The entered value is not valid.", "Please enter a value between -1000 and 1000.");
    return steps;
  }

  const push = (line: number, description: string, nextHint: string, highlights: Record<number, HighlightState>, pointers: any[]) => {
    steps.push({
      data: [...currentArray], highlights, line, kind: "pass", description, nextHint,
      vars: {
        arr: v("arr", `[${currentArray.join(", ")}]`, "list"),
        index: v("index", index, "int"),
        val: v("val", val, "int"),
        i: v("i", i, "int"),
        result: v("result", returnValue, "list"),
      },
      pointers,
    });
  };

  push(1, `insert_at_index(arr, ${index}, ${val}) called.`, `Expanding array by 1.`, {}, []);

  currentArray.push(0);
  push(2, `arr.append(0)`, `Allocated a new slot initialized to 0.`, { [n]: "compare" }, []);

  for (let idx = n; idx > index; idx--) {
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
  push(5, `arr[${index}] = ${val}`, `Inserting the new value at index ${index}.`, { [index]: "compare" }, [{ index, label: index.toString(), color: "purple" }]);
  
  currentArray[index] = val;
  push(5, `arr[${index}] = ${val}`, `New value inserted.`, { [index]: "active" }, [{ index, label: index.toString(), color: "purple" }]);

  returnValue = `[${currentArray.join(", ")}]`;
  push(6, `return arr`, `Function completes.`, {}, []);

  return steps;
}

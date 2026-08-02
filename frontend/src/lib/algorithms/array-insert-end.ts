import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const arrayInsertEndMeta: AlgorithmMeta = {
  id: "array-insert-end",
  name: "Insert at End",
  category: "Arrays",
  description: "Appends a new element to the end of the array.",
  timeComplexity: { best: "Ω(1)", average: "Θ(1)", worst: "O(n)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def insert_at_end(arr, val):",
    "    arr.append(val)",
    "    return arr"
  ],
};

export function generateArrayInsertEndSteps(input: number[], target?: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  const currentArray = [...input];

  const val = target !== undefined ? target : 99;

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
      },
      pointers,
    });
  };

  push(1, `insert_at_end(arr, ${val}) called.`, `Allocating new slot at end of array.`, {}, []);

  currentArray.push(val);
  push(2, `arr.append(${val})`, `Value inserted at index ${n}.`, { [n]: "active" }, [{ index: n, label: "end", color: "amber" }]);

  push(3, `return arr`, `Function completes.`, {}, []);

  return steps;
}

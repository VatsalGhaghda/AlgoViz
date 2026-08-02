import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const stackIsEmptyMeta: AlgorithmMeta = {
  id: "stack-is-empty",
  name: "isEmpty",
  category: "Stacks",
  description: "Checks if the stack contains zero elements.",
  timeComplexity: { best: "Ω(1)", average: "Θ(1)", worst: "O(1)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def demo_stack_isempty():",
    "    arr = [None] * 5",
    "    capacity = 5",
    "    top = -1",
    "",
    "    return top == -1"
  ],
};

export function generateStackIsEmptySteps(): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const capacity = 5;
  const currentStack: number[] = [];
  const top = -1;

  const v = (name: string, value: any, type: any) => {
    const prevVars = steps.length > 0 ? steps[steps.length - 1].vars : null;
    const isChanged = prevVars ? prevVars[name]?.value !== value : false;
    return { value, type, ...(isChanged ? { changed: true } : {}) };
  };

  const getPaddedArr = (arr: number[], cap: number) => {
    const padded = [...arr];
    while (padded.length < cap) padded.push("None" as any);
    return padded;
  };

  let returnValue: string = "None";

  const addStep = (
    line: number,
    description: string,
    nextHint: string,
    highlights: Record<number, HighlightState> = {},
    error = false,
    overrideVars: any = {}
  ) => {
    const ptrs = [];
    if (top >= 0 && overrideVars.top !== "None") {
      ptrs.push({ index: top, label: "top", color: "cyan" });
    }

    const currentVars = {
      arr: v("arr", overrideVars.arr !== undefined ? overrideVars.arr : `[${getPaddedArr(currentStack, capacity).join(", ")}]`, "list"),
      capacity: v("capacity", overrideVars.capacity !== undefined ? overrideVars.capacity : capacity, "int"),
      top: v("top", overrideVars.top !== undefined ? overrideVars.top : top, "int"),
      result: v("result", overrideVars.result !== undefined ? overrideVars.result : returnValue, "bool"),
    };

    steps.push({
      data: [...currentStack], highlights, line, kind: error ? "error" : "pass", description, nextHint,
      vars: currentVars,
      pointers: ptrs,
    });
  };

  addStep(1, "demo_stack_isempty() started.", "Initialize array and variables.", {}, false, { arr: "None", capacity: "None", top: "None", result: "None" });
  addStep(2, "arr = [None] * 5", "Array initialized empty.", {}, false, { capacity: "None", top: "None", result: "None" });
  addStep(3, "capacity = 5", "Capacity set to 5.", {}, false, { top: "None", result: "None" });
  addStep(4, "top = -1", "Top pointer initialized to -1 (empty).", {}, false, { result: "None" });

  returnValue = "True";
  addStep(6, `return top == -1`, `-1 == -1 evaluates to True. Stack is empty.`, {});

  return steps;
}

import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const stackPeekMeta: AlgorithmMeta = {
  id: "stack-peek",
  name: "Peek",
  category: "Stacks",
  description: "Demonstrates peeking at the top element without removing it.",
  timeComplexity: { best: "Ω(1)", average: "Θ(1)", worst: "O(1)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def demo_stack_peek():",
    "    arr = [12, 34, 56]",
    "    capacity = 5",
    "    top = 2",
    "",
    "    if top == -1:",
    "        print('Stack is empty')",
    "        return None",
    "    return arr[top]"
  ],
};

export function generateStackPeekSteps(): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const capacity = 5;
  const currentStack: number[] = [12, 34, 56];
  const top = 2;

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

  let returnValue: number | string = "None";

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
      result: v("result", overrideVars.result !== undefined ? overrideVars.result : returnValue, "int"),
    };

    steps.push({
      data: [...currentStack], highlights, line, kind: error ? "error" : "pass", description, nextHint,
      vars: currentVars,
      pointers: ptrs,
    });
  };

  addStep(1, "demo_stack_peek() started.", "Initialize array and variables.", {}, false, { arr: "None", capacity: "None", top: "None", result: "None" });
  addStep(2, "arr = [12, 34, 56]", "Array initialized with 3 elements.", {}, false, { capacity: "None", top: "None", result: "None" });
  addStep(3, "capacity = 5", "Capacity set to 5.", {}, false, { top: "None", result: "None" });
  addStep(4, "top = 2", "Top pointer initialized to 2.", {}, false, { result: "None" });

  addStep(6, `if top == -1: False`, "Stack has elements.", { [top]: "active" }, false, { result: "None" });
  
  returnValue = currentStack[top];
  addStep(9, `return arr[top]`, `Returned the top element ${returnValue}.`, { [top]: "found" });

  return steps;
}

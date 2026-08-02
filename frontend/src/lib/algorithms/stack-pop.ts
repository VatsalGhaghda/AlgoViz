import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const stackPopMeta: AlgorithmMeta = {
  id: "stack-pop",
  name: "Pop Sequence",
  category: "Stacks",
  description: "Demonstrates popping elements until Stack Underflow occurs.",
  timeComplexity: { best: "Ω(1)", average: "Θ(1)", worst: "O(1)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def demo_stack_pop():",
    "    arr = [12, 34, 56, 78, 90]",
    "    capacity = 5",
    "    top = 4",
    "",
    "    for i in range(6):",
    "        if top == -1:",
    "            print('Stack Underflow')",
    "            break",
    "        value = arr[top]",
    "        arr[top] = None",
    "        top -= 1"
  ],
};

export function generateStackPopSteps(): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const capacity = 5;
  const currentStack: number[] = [12, 34, 56, 78, 90];
  let top = 4;

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

  let currentValue: number | string = "None";

  const addStep = (
    line: number,
    description: string,
    nextHint: string,
    highlights: Record<number, HighlightState> = {},
    error = false,
    overrideVars: any = {}
  ) => {
    // Default pointer for top
    const ptrs = [];
    if (top >= 0 && overrideVars.top !== "None") {
      ptrs.push({ index: top, label: "top", color: "cyan" });
    }

    const currentVars = {
      arr: v("arr", overrideVars.arr !== undefined ? overrideVars.arr : `[${getPaddedArr(currentStack, capacity).join(", ")}]`, "list"),
      capacity: v("capacity", overrideVars.capacity !== undefined ? overrideVars.capacity : capacity, "int"),
      top: v("top", overrideVars.top !== undefined ? overrideVars.top : top, "int"),
      value: v("value", overrideVars.value !== undefined ? overrideVars.value : currentValue, "int"),
    };

    steps.push({
      data: [...currentStack], highlights, line, kind: error ? "error" : "pass", description, nextHint,
      vars: currentVars,
      pointers: ptrs,
    });
  };

  addStep(1, "demo_stack_pop() started.", "Initialize array and variables.", {}, false, { arr: "None", capacity: "None", top: "None", value: "None" });
  addStep(2, "arr = [12, 34, 56, 78, 90]", "Array initialized with 5 elements.", {}, false, { capacity: "None", top: "None", value: "None" });
  addStep(3, "capacity = 5", "Capacity set to 5.", {}, false, { top: "None", value: "None" });
  addStep(4, "top = 4", "Top pointer initialized to 4.", {}, false, { value: "None" });

  for (let i = 0; i < 6; i++) {
    addStep(6, `for i in range(6): i = ${i}`, "Start loop iteration.");

    if (top === -1) {
      addStep(7, `if top == -1: True`, "Stack is empty.", {}, true);
      addStep(8, `Stack Underflow!`, "Cannot pop from an empty stack.", {}, true);
      addStep(9, `break`, "Exiting loop.", {}, true);
      break;
    }

    addStep(7, `if top == -1: False`, "Stack has elements.", { [top]: "active" });
    
    currentValue = currentStack[top];
    addStep(10, `value = arr[top]`, `Accessed top element ${currentValue}.`, { [top]: "found" });

    currentStack[top] = "None" as any;
    addStep(11, `arr[top] = None`, `Element removed from stack.`, { [top]: "active" });

    top -= 1;
    addStep(12, `top -= 1`, `Top pointer decremented to ${top}.`, top >= 0 ? { [top]: "active" } : {});
  }

  return steps;
}

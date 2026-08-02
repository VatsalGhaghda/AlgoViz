import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const stackPushMeta: AlgorithmMeta = {
  id: "stack-push",
  name: "Push Sequence",
  category: "Stacks",
  description: "Demonstrates pushing elements until Stack Overflow occurs.",
  timeComplexity: { best: "Ω(1)", average: "Θ(1)", worst: "O(1)" },
  spaceComplexity: "O(N)",
  language: "python",
  codeLines: [
    "def demo_stack_push():",
    "    arr = [None] * 5",
    "    capacity = 5",
    "    top = -1",
    "",
    "    values = [12, 34, 56, 78, 90, 99]",
    "",
    "    for value in values:",
    "        if top == capacity - 1:",
    "            print('Stack Overflow')",
    "            break",
    "        top += 1",
    "        arr[top] = value"
  ],
};

export function generateStackPushSteps(): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const capacity = 5;
  const currentStack: number[] = [];
  let top = -1;

  const valuesToPush = [12, 34, 56, 78, 90, 99];

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
    const ptrs: import("@/types/visualization").Pointer[] = [];
    if (top >= 0 && overrideVars.top !== "None") {
      ptrs.push({ index: top, label: "top", color: "cyan" as const });
    }

    const currentVars = {
      arr: v("arr", overrideVars.arr !== undefined ? overrideVars.arr : `[${getPaddedArr(currentStack, capacity).join(", ")}]`, "list"),
      capacity: v("capacity", overrideVars.capacity !== undefined ? overrideVars.capacity : capacity, "int"),
      top: v("top", overrideVars.top !== undefined ? overrideVars.top : top, "int"),
      values: v("values", overrideVars.values !== undefined ? overrideVars.values : `[${valuesToPush.join(", ")}]`, "list"),
      value: v("value", overrideVars.value !== undefined ? overrideVars.value : currentValue, "int"),
    };

    steps.push({
      data: [...currentStack], highlights, line, kind: error ? "error" : "pass", description, nextHint,
      vars: currentVars,
      pointers: ptrs,
    });
  };

  addStep(1, "demo_stack_push() started.", "Initialize array and variables.", {}, false, { arr: "None", capacity: "None", top: "None", values: "None", value: "None" });
  addStep(2, "arr = [None] * 5", "Array initialized with capacity 5.", {}, false, { capacity: "None", top: "None", values: "None", value: "None" });
  addStep(3, "capacity = 5", "Capacity set to 5.", {}, false, { top: "None", values: "None", value: "None" });
  addStep(4, "top = -1", "Top pointer initialized to -1 (empty).", {}, false, { values: "None", value: "None" });
  addStep(6, "values = [12, 34, 56, 78, 90, 99]", "Values to push initialized.", {}, false, { value: "None" });

  for (let i = 0; i < valuesToPush.length; i++) {
    currentValue = valuesToPush[i];
    addStep(8, `for value in values: value = ${currentValue}`, "Start loop iteration.");

    if (top === capacity - 1) {
      addStep(9, `if top == capacity - 1: True`, "Stack capacity reached.", { [top]: "error" }, true);
      addStep(10, `Stack Overflow!`, `Cannot push ${currentValue}.`, { [top]: "error" }, true);
      addStep(11, `break`, "Exiting loop.", { [top]: "error" }, true);
      break;
    }

    addStep(9, `if top == capacity - 1: False`, "Stack has space.", (top >= 0 ? { [top]: "active" } : {}));
    
    top += 1;
    addStep(12, `top += 1`, `Top pointer incremented to ${top}.`, { [top]: "active" });

    currentStack.push(currentValue);
    addStep(13, `arr[top] = value`, `Value ${currentValue} inserted at arr[${top}].`, { [top]: "active" });
  }

  return steps;
}

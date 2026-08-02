import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const queueFrontMeta: AlgorithmMeta = {
  id: "queue-front",
  name: "Front",
  category: "Queues",
  description: "Reads the element at the front of the queue without removing it (same as Peek).",
  timeComplexity: { best: "Ω(1)", average: "Θ(1)", worst: "O(1)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def demo_queue_front():",
    "    arr = [12, 34, 56, 78, 90]",
    "    capacity = 5",
    "    front = 0",
    "    rear = 4",
    "",
    "    if front == -1 or front > rear:",
    "        print('Queue is Empty')",
    "        return None",
    "    ",
    "    return arr[front]"
  ],
};

export function generateQueueFrontSteps(): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const capacity = 5;
  const currentQueue = [12, 34, 56, 78, 90];
  let front = 0;
  let rear = 4;

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
    if (front >= 0 && overrideVars.front !== "None") {
      ptrs.push({ index: front, label: "front", color: "cyan" });
    }
    if (rear >= 0 && overrideVars.rear !== "None") {
      ptrs.push({ index: rear, label: "rear", color: "purple" });
    }

    const currentVars = {
      arr: v("arr", overrideVars.arr !== undefined ? overrideVars.arr : `[${getPaddedArr(currentQueue, capacity).join(", ")}]`, "list"),
      capacity: v("capacity", overrideVars.capacity !== undefined ? overrideVars.capacity : capacity, "int"),
      front: v("front", overrideVars.front !== undefined ? overrideVars.front : front, "int"),
      rear: v("rear", overrideVars.rear !== undefined ? overrideVars.rear : rear, "int"),
      result: v("result", overrideVars.result !== undefined ? overrideVars.result : returnValue, "int"),
    };

    steps.push({
      data: [...currentQueue], highlights, line, kind: error ? "error" : "pass", description, nextHint,
      vars: currentVars,
      pointers: ptrs,
    });
  };

  addStep(1, "demo_queue_front() started.", "Initialize array and variables.", {}, false, { arr: "None", capacity: "None", front: "None", rear: "None", result: "None" });
  addStep(2, "arr = [12, 34, 56, 78, 90]", "Array initialized with 5 elements.", {}, false, { capacity: "None", front: "None", rear: "None", result: "None" });
  addStep(3, "capacity = 5", "Capacity set to 5.", {}, false, { front: "None", rear: "None", result: "None" });
  addStep(4, "front = 0", "Front pointer initialized to 0.", {}, false, { rear: "None", result: "None" });
  addStep(5, "rear = 4", "Rear pointer initialized to 4.", {}, false, { result: "None" });

  addStep(7, `if front == -1 or front > rear: False`, "Queue is not empty.");
  
  returnValue = String(currentQueue[front]);
  addStep(11, `return arr[front]`, `Read successful. The front element is ${returnValue}.`, { [front]: "found" });

  return steps;
}

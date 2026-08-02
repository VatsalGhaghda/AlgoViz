import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const queueEnqueueMeta: AlgorithmMeta = {
  id: "queue-enqueue",
  name: "Enqueue Sequence",
  category: "Queues",
  description: "Demonstrates enqueuing elements into a simple array-based queue until Queue Overflow occurs.",
  timeComplexity: { best: "Ω(1)", average: "Θ(1)", worst: "O(1)" },
  spaceComplexity: "O(N)",
  language: "python",
  codeLines: [
    "def demo_queue_enqueue():",
    "    arr = [None] * 5",
    "    capacity = 5",
    "    front = -1",
    "    rear = -1",
    "",
    "    values = [12, 34, 56, 78, 90, 99]",
    "",
    "    for value in values:",
    "        if rear == capacity - 1:",
    "            print('Queue Overflow')",
    "            break",
    "        if front == -1:",
    "            front = 0",
    "        rear += 1",
    "        arr[rear] = value"
  ],
};

export function generateQueueEnqueueSteps(): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const capacity = 5;
  const currentQueue: number[] = [];
  let front = -1;
  let rear = -1;

  const valuesToEnqueue = [12, 34, 56, 78, 90, 99];

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
    // Default pointers for front and rear
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
      values: v("values", overrideVars.values !== undefined ? overrideVars.values : `[${valuesToEnqueue.join(", ")}]`, "list"),
      value: v("value", overrideVars.value !== undefined ? overrideVars.value : currentValue, "int"),
    };

    steps.push({
      data: [...currentQueue], highlights, line, kind: error ? "error" : "pass", description, nextHint,
      vars: currentVars,
      pointers: ptrs,
    });
  };

  addStep(1, "demo_queue_enqueue() started.", "Initialize array and variables.", {}, false, { arr: "None", capacity: "None", front: "None", rear: "None", values: "None", value: "None" });
  addStep(2, "arr = [None] * 5", "Array initialized with capacity 5.", {}, false, { capacity: "None", front: "None", rear: "None", values: "None", value: "None" });
  addStep(3, "capacity = 5", "Capacity set to 5.", {}, false, { front: "None", rear: "None", values: "None", value: "None" });
  addStep(4, "front = -1", "Front pointer initialized to -1 (empty).", {}, false, { rear: "None", values: "None", value: "None" });
  addStep(5, "rear = -1", "Rear pointer initialized to -1 (empty).", {}, false, { values: "None", value: "None" });
  addStep(7, "values = [12, 34, 56, 78, 90, 99]", "Values to enqueue initialized.", {}, false, { value: "None" });

  for (let i = 0; i < valuesToEnqueue.length; i++) {
    currentValue = valuesToEnqueue[i];
    addStep(9, `for value in values: value = ${currentValue}`, "Start loop iteration.");

    if (rear === capacity - 1) {
      addStep(10, `if rear == capacity - 1: True`, "Queue capacity reached.", { [rear]: "error" }, true);
      addStep(11, `Queue Overflow!`, `Cannot enqueue ${currentValue}.`, { [rear]: "error" }, true);
      addStep(12, `break`, "Exiting loop.", { [rear]: "error" }, true);
      break;
    }

    addStep(10, `if rear == capacity - 1: False`, "Queue has space.", (rear >= 0 ? { [rear]: "active" } : {}));

    if (front === -1) {
      addStep(13, `if front == -1: True`, "Queue is currently empty.");
      front = 0;
      addStep(14, `front = 0`, "Initialize front pointer to 0.", { [0]: "active" });
    } else {
      addStep(13, `if front == -1: False`, "Queue already has elements.");
    }
    
    rear += 1;
    addStep(15, `rear += 1`, `Rear pointer incremented to ${rear}.`, { [rear]: "active" });

    currentQueue.push(currentValue);
    addStep(16, `arr[rear] = value`, `Value ${currentValue} inserted at arr[${rear}].`, { [rear]: "active" });
  }

  return steps;
}

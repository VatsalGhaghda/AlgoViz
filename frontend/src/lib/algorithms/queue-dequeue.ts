import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const queueDequeueMeta: AlgorithmMeta = {
  id: "queue-dequeue",
  name: "Dequeue Sequence",
  category: "Queues",
  description: "Demonstrates dequeuing elements from a simple array-based queue until Queue Underflow occurs.",
  timeComplexity: { best: "Ω(1)", average: "Θ(1)", worst: "O(1)" },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def demo_queue_dequeue():",
    "    arr = [12, 34, 56, 78, 90]",
    "    capacity = 5",
    "    front = 0",
    "    rear = 4",
    "",
    "    for _ in range(6):",
    "        if front == -1 or front > rear:",
    "            print('Queue Underflow')",
    "            break",
    "        value = arr[front]",
    "        front += 1",
    "        if front > rear:",
    "            front = -1",
    "            rear = -1"
  ],
};

export function generateQueueDequeueSteps(): VisualizationStep[] {
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

  let currentValue: number | string = "None";

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
      value: v("value", overrideVars.value !== undefined ? overrideVars.value : currentValue, "int"),
    };

    steps.push({
      data: [...currentQueue], highlights, line, kind: error ? "error" : "pass", description, nextHint,
      vars: currentVars,
      pointers: ptrs,
    });
  };

  addStep(1, "demo_queue_dequeue() started.", "Initialize array and variables.", {}, false, { arr: "None", capacity: "None", front: "None", rear: "None", value: "None" });
  addStep(2, "arr = [12, 34, 56, 78, 90]", "Array initialized with 5 elements.", {}, false, { capacity: "None", front: "None", rear: "None", value: "None" });
  addStep(3, "capacity = 5", "Capacity set to 5.", {}, false, { front: "None", rear: "None", value: "None" });
  addStep(4, "front = 0", "Front pointer initialized to 0.", {}, false, { rear: "None", value: "None" });
  addStep(5, "rear = 4", "Rear pointer initialized to 4.", {}, false, { value: "None" });

  for (let i = 0; i < 6; i++) {
    addStep(7, `for _ in range(6): iteration ${i + 1}`, "Start loop iteration.");

    if (front === -1 || front > rear) {
      addStep(8, `if front == -1 or front > rear: True`, "Queue is completely empty.", { [0]: "error" });
      addStep(9, `Queue Underflow!`, `Cannot dequeue from an empty queue.`, { [0]: "error" });
      addStep(10, `break`, "Exiting loop.");
      break;
    }

    addStep(8, `if front == -1 or front > rear: False`, "Queue has elements.");
    
    currentValue = currentQueue[front];
    addStep(11, `value = arr[front]`, `Read value ${currentValue} from front.`, { [front]: "active" });

    const dequeuedIndex = front;
    currentQueue[dequeuedIndex] = "None" as any;
    front += 1;
    addStep(12, `front += 1`, `Front pointer incremented to ${front}. Item left logical queue.`, { [dequeuedIndex]: "active" });

    if (front > rear) {
      addStep(13, `if front > rear: True`, "Last element was dequeued. Resetting pointers.");
      front = -1;
      addStep(14, `front = -1`, "Reset front.", {}, false, { front: -1 });
      rear = -1;
      addStep(15, `rear = -1`, "Reset rear.", {}, false, { front: -1, rear: -1 });
    } else {
      addStep(13, `if front > rear: False`, "More elements remain in queue.");
    }
  }

  return steps;
}

import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const linkedListCreateMeta: AlgorithmMeta = {
  id: "linked-list-create",
  name: "Create Linked List",
  category: "Linked List",
  description: "Creates a linked list from an array of elements by appending nodes sequentially.",
  timeComplexity: {
    best: "Ω(n)",
    average: "Θ(n)",
    worst: "O(n)"
  },
  spaceComplexity: "O(n)",
  language: "python",
  codeLines: [
    "class Node:",
    "    def __init__(self, data):",
    "        self.data = data",
    "        self.next = None",
    "",
    "def createLinkedList(arr):",
    "    if not arr: return None",
    "    head = Node(arr[0])",
    "    current = head",
    "    for i in range(1, len(arr)):",
    "        new_node = Node(arr[i])",
    "        current.next = new_node",
    "        current = new_node",
    "    return head"
  ],
};

export function generateLinkedListCreateSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;

  if (n === 0) return steps;

  // We'll track variables
  let nodes: { id: number; val: number; next: number | null }[] = [];
  let head: number | null = null;
  let current: number | null = null;
  let newNode: number | null = null;
  let returnValue: number | string = "None";
  let trajectory: number[] = []; // just for trajectory tracking if needed

  const push = (
    line: number,
    description: string,
    nextHint: string,
    highlights: Record<number, HighlightState>,
    pointers: any[]
  ) => {
    const prevVars = steps.length > 0 ? steps[steps.length - 1].vars : null;
    const v = (name: string, val: any, type: any) => {
      const isChanged = prevVars ? prevVars[name]?.value !== val : false;
      return { value: val, type, ...(isChanged ? { changed: true } : {}) };
    };

    steps.push({
      data: [...input],
      highlights,
      line,
      kind: "pass",
      description,
      nextHint,
      vars: {
        _nodes: { value: JSON.parse(JSON.stringify(nodes)), type: "list" },
        list: v("list", `[${trajectory.join(", ")}]`, "list"),
        head: v("head", head !== null ? head : "None", "int"),
        current: v("current", current !== null ? current : "None", "int"),
        new_node: v("new_node", newNode !== null ? newNode : "None", "int"),
        result: v("result", returnValue, "int"),
      },
      trajectory: [...trajectory],
      pointers,
    });
  };

  // Step 1: Initial call
  push(6, `createLinkedList(arr) called with length ${n}`, `Checking if array is empty.`, {}, []);

  push(7, `arr is not empty.`, `Creating head node.`, {}, []);

  // Create head
  nodes.push({ id: 0, val: input[0], next: null });
  head = 0;
  trajectory.push(input[0]);

  push(8, `head = Node(${input[0]})`, `Setting current pointer to head.`, { 0: "active" }, [{ id: "head", index: 0, label: "head", color: "emerald" }]);

  current = head;
  push(9, `current = head`, `Entering loop to add remaining elements.`, { 0: "active" }, [
    { id: "head", index: 0, label: "head", color: "emerald" },
    { id: "current", index: 0, label: "current", color: "cyan" }
  ]);

  for (let i = 1; i < n; i++) {
    const val = input[i];

    push(10, `for i = ${i} (value: ${val})`, `Creating new node.`, { [i]: "compare" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "current", index: current, label: "current", color: "cyan" }
    ]);

    // Create new node
    nodes.push({ id: i, val, next: null });
    newNode = i;

    push(11, `new_node = Node(${val})`, `Linking current.next to new_node.`, { [i]: "active" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "current", index: current, label: "current", color: "cyan" },
      { id: "new_node", index: newNode, label: "new_node", color: "amber" }
    ]);

    // Link
    const prevCurrent = current;
    nodes[current].next = newNode;
    trajectory.push(val);

    push(12, `current.next = new_node`, `Advancing current pointer.`, { [i]: "active", [prevCurrent]: "key" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "current", index: current, label: "current", color: "cyan" },
      { id: "new_node", index: newNode, label: "new_node", color: "amber" }
    ]);

    // Advance current
    current = newNode;
    newNode = null;

    push(13, `current = new_node`, `Continuing loop.`, { [i]: "active" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "current", index: current, label: "current", color: "cyan" }
    ]);
  }

  returnValue = head;
  push(14, `Loop finished.`, `Returning head of linked list.`, {}, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" }
  ]);

  return steps;
}

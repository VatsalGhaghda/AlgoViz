import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const linkedListInsertEndMeta: AlgorithmMeta = {
  id: "linked-list-insert-end",
  name: "Insert at End",
  category: "Linked List",
  description: "Inserts a new node at the end of a linked list.",
  timeComplexity: {
    best: "Ω(n)",
    average: "Θ(n)",
    worst: "O(n)"
  },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def insertAtEnd(head, val):",
    "    new_node = Node(val)",
    "    if not head:",
    "        return new_node",
    "    current = head",
    "    while current.next:",
    "        current = current.next",
    "    current.next = new_node",
    "    return head"
  ],
};

export function generateLinkedListInsertEndSteps(input: number[], target?: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  if (n === 0) return steps;

  const targetVal = target !== undefined ? target : 99;

  let nodes = input.map((val, idx) => ({ id: idx, val, next: idx < n - 1 ? idx + 1 : null }));
  let head: number | null = 0;
  let current: number | null = null;
  let newNode: number | null = null;
  const newNodeId = n;
  
  let listArray = [...input];

  const v = (name: string, val: any, type: any) => {
    const prevVars = steps.length > 0 ? steps[steps.length - 1].vars : null;
    const isChanged = prevVars ? prevVars[name]?.value !== val : false;
    return { value: val, type, ...(isChanged ? { changed: true } : {}) };
  };

  const push = (
    line: number,
    description: string,
    nextHint: string,
    highlights: Record<number, HighlightState>,
    pointers: any[]
  ) => {
    steps.push({
      data: [...input],
      highlights,
      line,
      kind: "pass",
      description,
      nextHint,
      vars: {
        _nodes: { value: JSON.parse(JSON.stringify(nodes)), type: "list" },
        list: v("list", `[${listArray.join(", ")}]`, "list"),
        head: v("head", head !== null ? head : "None", "int"),
        current: v("current", current !== null ? current : "None", "int"),
        new_node: v("new_node", newNode !== null ? newNode : "None", "int"),
        val: v("val", targetVal, "int"),
        result: v("result", "None", "int")
      },
      pointers,
    });
  };

  const pushResult = (line: number, description: string, nextHint: string, resultValue: any, pointers: any[]) => {
    steps.push({
      data: [...input],
      highlights: {},
      line,
      kind: "pass",
      description,
      nextHint,
      vars: {
        _nodes: { value: JSON.parse(JSON.stringify(nodes)), type: "list" },
        list: v("list", `[${listArray.join(", ")}]`, "list"),
        head: v("head", head !== null ? head : "None", "int"),
        current: v("current", current !== null ? current : "None", "int"),
        new_node: v("new_node", newNode !== null ? newNode : "None", "int"),
        val: v("val", targetVal, "int"),
        result: v("result", resultValue !== null ? resultValue : "None", "int")
      },
      pointers,
    });
  };

  const pushValueError = () => {
    steps.push({
      data: [...input],
      highlights: {},
      line: 0,
      kind: "pass",
      description: "The entered value is not valid.",
      nextHint: `Please enter a value between -1000 and 1000.`,
      vars: {
        _nodes: { value: JSON.parse(JSON.stringify(nodes)), type: "list" },
        list: v("list", `[${listArray.join(", ")}]`, "list"),
        head: v("head", head !== null ? head : "None", "int"),
        current: v("current", current !== null ? current : "None", "int"),
        new_node: v("new_node", newNode !== null ? newNode : "None", "int"),
        val: v("val", targetVal, "int"),
        result: v("result", "None", "int")
      },
      pointers: [],
    });
  };

  if (targetVal < -1000 || targetVal > 1000) {
    pushValueError();
    return steps;
  }

  push(1, `insertAtEnd(head, ${targetVal}) called`, `Creating new node.`, {}, [{ id: "head", index: head, label: "head", color: "emerald" }]);

  newNode = newNodeId;
  nodes.push({ id: newNode, val: targetVal, next: null });
  
  push(2, `new_node = Node(${targetVal})`, `Checking if head is null.`, { [newNode]: "active" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" }
  ]);

  push(3, `if not head:`, `Head is not null, traversing list.`, {}, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" }
  ]);

  current = head;
  push(5, `current = head`, `Beginning traversal.`, { [current]: "active" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" },
    { id: "current", index: current, label: "current", color: "cyan" }
  ]);

  while (nodes[current].next !== null) {
    push(6, `while current.next:`, `current.next is not null.`, { [current]: "compare" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "new_node", index: newNode, label: "new_node", color: "amber" },
      { id: "current", index: current, label: "current", color: "cyan" }
    ]);
    current = nodes[current].next;
    push(7, `current = current.next`, `Advancing current pointer.`, { [current]: "active" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "new_node", index: newNode, label: "new_node", color: "amber" },
      { id: "current", index: current, label: "current", color: "cyan" }
    ]);
  }

  push(6, `while current.next:`, `Reached end of list.`, { [current]: "key" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" },
    { id: "current", index: current, label: "current", color: "cyan" }
  ]);

  nodes[current].next = newNode;
  listArray.push(targetVal);

  push(8, `current.next = new_node`, `Linked new node at the end.`, { [current]: "key", [newNode]: "found" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" },
    { id: "current", index: current, label: "current", color: "cyan" }
  ]);

  pushResult(9, `return head`, `Insertion complete.`, head, [
    { id: "head", index: head, label: "head", color: "emerald" }
  ]);

  return steps;
}

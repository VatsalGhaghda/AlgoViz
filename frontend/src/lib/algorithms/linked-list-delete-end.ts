import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const linkedListDeleteEndMeta: AlgorithmMeta = {
  id: "linked-list-delete-end",
  name: "Delete at End",
  category: "Linked List",
  description: "Deletes the last node of a linked list.",
  timeComplexity: {
    best: "Ω(n)",
    average: "Θ(n)",
    worst: "O(n)"
  },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def deleteAtEnd(head):",
    "    if not head:",
    "        return None",
    "    if not head.next:",
    "        del head",
    "        return None",
    "    current = head",
    "    while current.next.next:",
    "        current = current.next",
    "    temp = current.next",
    "    current.next = None",
    "    temp.next = None",
    "    del temp",
    "    return head"
  ],
};

export function generateLinkedListDeleteEndSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  if (n === 0) return steps;

  let nodes = input.map((val, idx) => ({ id: idx, val, next: idx < n - 1 ? idx + 1 : null }));
  let head: number | null = 0;
  let current: number | null = null;
  let temp: number | null = null;
  
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
        temp: v("temp", temp !== null ? temp : "None", "int"),
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
        temp: v("temp", temp !== null ? temp : "None", "int"),
        result: v("result", resultValue !== null ? resultValue : "None", "int")
      },
      pointers,
    });
  };

  push(1, `deleteAtEnd(head) called`, `Checking if head is null.`, {}, [{ id: "head", index: head, label: "head", color: "emerald" }]);

  push(2, `if not head:`, `Head is not null.`, {}, [
    { id: "head", index: head, label: "head", color: "emerald" }
  ]);

  push(4, `if not head.next:`, `Checking if there is only one node.`, {}, [
    { id: "head", index: head, label: "head", color: "emerald" }
  ]);

  if (n === 1) {
    listArray.pop();
    const deletedNode = head;
    head = null;
    nodes = nodes.filter(n => n.id !== deletedNode);

    push(5, `del head`, `Deleting the only node.`, { [deletedNode!]: "error" }, []);
    pushResult(6, `return None`, `List is now empty.`, "None", []);
    return steps;
  }

  current = head;
  push(7, `current = head`, `Initializing traversal.`, { [current]: "active" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" }
  ]);

  while (nodes[current].next !== null && nodes[nodes[current].next!].next !== null) {
    push(8, `while current.next.next:`, `Checking next.next.`, { [current]: "compare" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "current", index: current, label: "current", color: "cyan" }
    ]);
    
    current = nodes[current].next!;
    
    push(9, `current = current.next`, `Advancing current pointer.`, { [current]: "active" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "current", index: current, label: "current", color: "cyan" }
    ]);
  }

  push(8, `while current.next.next:`, `Reached second to last node.`, { [current]: "key" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" }
  ]);

  temp = nodes[current].next;
  push(10, `temp = current.next`, `Storing last node in temp.`, { [current]: "key", [temp!]: "active" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" },
    { id: "temp", index: temp, label: "temp", color: "amber" }
  ]);

  nodes[current].next = null;
  listArray.pop();

  push(11, `current.next = None`, `Severing link to last node.`, { [current]: "active", [temp!]: "key" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" },
    { id: "temp", index: temp, label: "temp", color: "amber" }
  ]);

  push(12, `temp.next = None`, `Severing the deleted node's next pointer.`, { [temp!]: "error" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" },
    { id: "temp", index: temp, label: "temp", color: "amber" }
  ]);

  nodes = nodes.filter(n => n.id !== temp);

  const deletedNode = temp;
  temp = null;
  push(13, `del temp`, `Deleting last node.`, { [deletedNode!]: "error" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" }
  ]);

  pushResult(14, `return head`, `Deletion complete.`, head, [
    { id: "head", index: head, label: "head", color: "emerald" }
  ]);

  return steps;
}

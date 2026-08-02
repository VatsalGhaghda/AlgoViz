import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const linkedListDeletePositionMeta: AlgorithmMeta = {
  id: "linked-list-delete-position",
  name: "Delete at Position",
  category: "Linked List",
  description: "Deletes a node at a specific index in the linked list.",
  timeComplexity: {
    best: "Î©(1)",
    average: "Î˜(n)",
    worst: "O(n)"
  },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def deleteAtPosition(head, pos):",
    "    if not head:",
    "        return None",
    "    if pos == 0:",
    "        temp = head",
    "        head = head.next",
    "        temp.next = None",
    "        del temp",
    "        return head",
    "    current = head",
    "    for _ in range(pos - 1):",
    "        if not current.next:",
    "            break",
    "        current = current.next",
    "    if not current.next:",
    "        return head",
    "    temp = current.next",
    "    current.next = temp.next",
    "    temp.next = None",
    "    del temp",
    "    return head"
  ],
};

export function generateLinkedListDeletePositionSteps(input: number[], target?: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  if (n === 0) return steps;

  let pos = target !== undefined ? target : Math.floor(n / 2);

  let nodes = input.map((val, idx) => ({ id: idx, val, next: idx < n - 1 ? idx + 1 : null }));
  let listArray = [...input];

  const pushError = () => {
    steps.push({
      data: [...input],
      highlights: {},
      line: 0,
      kind: "pass",
      description: "The entered position is not valid.",
      nextHint: `Please enter a valid position between 0 and ${n - 1}.`,
      vars: {
        _nodes: { value: JSON.parse(JSON.stringify(nodes)), type: "list" },
        list: { value: `[${listArray.join(", ")}]`, type: "list" },
      },
      pointers: [],
    });
  };

  if (pos < 0 || pos >= n) {
    pushError();
    return steps;
  }
  let head: number | null = 0;
  let current: number | null = null;
  let temp: number | null = null;
  
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
        pos: v("pos", pos, "int"),
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
        pos: v("pos", pos, "int"),
        result: v("result", resultValue !== null ? resultValue : "None", "int")
      },
      pointers,
    });
  };

  push(1, `deleteAtPosition(head, ${pos}) called`, `Checking if head is null.`, {}, [{ id: "head", index: head, label: "head", color: "emerald" }]);

  push(2, `if not head:`, `Head is not null.`, {}, [
    { id: "head", index: head, label: "head", color: "emerald" }
  ]);

  push(4, `if pos == 0:`, `Checking if position is 0.`, {}, [
    { id: "head", index: head, label: "head", color: "emerald" }
  ]);

  if (pos === 0) {
    temp = head;
    push(5, `temp = head`, `Storing old head in temp.`, { [temp as number]: "active" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "temp", index: temp, label: "temp", color: "amber" }
    ]);

    head = nodes[head].next;
    push(6, `head = head.next`, `Advancing head.`, { [temp as number]: "key", ...(head !== null ? { [head]: "active" } : {}) }, [
      ...(head !== null ? [{ id: "head", index: head, label: "head", color: "emerald" }] : []),
      { id: "temp", index: temp, label: "temp", color: "amber" }
    ]);

    nodes[temp!].next = null;

    push(7, `temp.next = None`, `Severing the deleted node's next pointer.`, { [temp as number]: "error" }, [
      ...(head !== null ? [{ id: "head", index: head, label: "head", color: "emerald" }] : []),
      { id: "temp", index: temp, label: "temp", color: "amber" }
    ]);

    nodes = nodes.filter((n) => n.id !== temp);

    const deletedNode = temp;
    temp = null;
    push(8, `del temp`, `Deleting old head.`, { [deletedNode as number]: "error" }, [
      ...(head !== null ? [{ id: "head", index: head, label: "head", color: "emerald" }] : [])
    ]);

    pushResult(9, `return head`, `Deletion complete.`, head, [
      ...(head !== null ? [{ id: "head", index: head, label: "head", color: "emerald" }] : [])
    ]);

    return steps;
  }

  current = head;
  push(9, `current = head`, `Initializing traversal.`, { [current as number]: "active" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" }
  ]);

  let i = 0;
  for (; i < pos - 1; i++) {
    push(10, `for _ in range(pos - 1):`, `Checking if current.next is valid.`, { [current as number]: "compare" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "current", index: current, label: "current", color: "cyan" }
    ]);

    if (nodes[current].next === null) {
      push(11, `if not current.next: break`, `Reached end of list early.`, { [current as number]: "key" }, [
        { id: "head", index: head, label: "head", color: "emerald" },
        { id: "current", index: current, label: "current", color: "cyan" }
      ]);
      break;
    }
    
    current = nodes[current].next;
    push(12, `current = current.next`, `Advancing current pointer.`, { [current as number]: "active" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "current", index: current, label: "current", color: "cyan" }
    ]);
  }

  push(10, `for _ in range(pos - 1):`, `Loop finished.`, { [current as number]: "key" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" }
  ]);

  push(13, `if not current.next:`, `Checking if target node exists.`, { [current as number]: "compare" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" }
  ]);

  if (nodes[current].next === null) {
    push(13, `return head`, `Target node does not exist, aborting deletion.`, {}, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "current", index: current, label: "current", color: "cyan" }
    ]);
    return steps;
  }

  temp = nodes[current].next;
  push(14, `temp = current.next`, `Storing node to delete in temp.`, { [current as number]: "key", [temp as number]: "active" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" },
    { id: "temp", index: temp, label: "temp", color: "amber" }
  ]);

  nodes[current].next = nodes[temp!].next;
  listArray.splice(i + 1, 1);
  
  push(15, `current.next = temp.next`, `Bypassing the node to delete.`, { [current as number]: "active", [temp as number]: "key" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" },
    { id: "temp", index: temp, label: "temp", color: "amber" }
  ]);

  nodes[temp!].next = null;
  push(16, `temp.next = None`, `Severing the deleted node's next pointer.`, { [temp as number]: "error" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" },
    { id: "temp", index: temp, label: "temp", color: "amber" }
  ]);

  nodes = nodes.filter((n) => n.id !== temp);
  const deletedNode = temp;
  temp = null;
  push(17, `del temp`, `Deleting target node.`, { [deletedNode as number]: "error" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" }
  ]);

  pushResult(18, `return head`, `Deletion complete.`, head, [
    { id: "head", index: head, label: "head", color: "emerald" }
  ]);

  return steps;
}

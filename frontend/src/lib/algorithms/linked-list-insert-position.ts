import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const linkedListInsertPositionMeta: AlgorithmMeta = {
  id: "linked-list-insert-position",
  name: "Insert at Position",
  category: "Linked List",
  description: "Inserts a new node at a specific index in the linked list.",
  timeComplexity: {
    best: "Î©(1)",
    average: "Î˜(n)",
    worst: "O(n)"
  },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def insertAtPosition(head, val, pos):",
    "    new_node = Node(val)",
    "    if pos == 0:",
    "        new_node.next = head",
    "        return new_node",
    "    current = head",
    "    for _ in range(pos - 1):",
    "        if not current: break",
    "        current = current.next",
    "    new_node.next = current.next",
    "    current.next = new_node",
    "    return head"
  ],
};

export function generateLinkedListInsertPositionSteps(input: number[], target?: number, value?: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  if (n === 0) return steps;

  let pos = target !== undefined ? target : Math.floor(n / 2);
  
  let listArray = [...input];
  let nodes = input.map((val, idx) => ({ id: idx, val, next: idx < n - 1 ? idx + 1 : null, elevated: false }));

  const pushError = () => {
    steps.push({
      data: [...input],
      highlights: {},
      line: 0,
      kind: "pass",
      description: "The entered position is not valid.",
      nextHint: `Please enter a valid position between 0 and ${n}.`,
      vars: {
        _nodes: { value: JSON.parse(JSON.stringify(nodes)), type: "list" },
        list: { value: `[${listArray.join(", ")}]`, type: "list" },
      },
      pointers: [],
    });
  };

  if (pos < 0 || pos > n) {
    pushError();
    return steps;
  }

  const valToInsert = value !== undefined ? value : 99;

  let head: number | null = 0;
  let current: number | null = null;
  let newNode: number | null = null;
  const newNodeId = n;
  
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
        val: v("val", valToInsert, "int"),
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
        new_node: v("new_node", newNode !== null ? newNode : "None", "int"),
        val: v("val", valToInsert, "int"),
        pos: v("pos", pos, "int"),
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
        val: v("val", valToInsert, "int"),
        pos: v("pos", pos, "int"),
        result: v("result", "None", "int")
      },
      pointers: [],
    });
  };

  if (valToInsert < -1000 || valToInsert > 1000) {
    pushValueError();
    return steps;
  }

  push(1, `insertAtPosition(head, ${valToInsert}, ${pos}) called`, `Creating new node.`, {}, [{ id: "head", index: head, label: "head", color: "emerald" }]);

  newNode = newNodeId;
  nodes.push({ id: newNode, val: valToInsert, next: null, elevated: false });
  
  push(2, `new_node = Node(${valToInsert})`, `Checking if pos == 0.`, { [newNode]: "active" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" }
  ]);

  if (pos === 0) {
    push(3, `if pos == 0:`, `Position is 0, preparing to insert at head.`, {}, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "new_node", index: newNode, label: "new_node", color: "amber" }
    ]);

    // Elevate the node first
    nodes.find(n => n.id === newNode)!.elevated = true;
    push(3, `if pos == 0:`, `Elevating new node.`, { [newNode]: "active" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "new_node", index: newNode, label: "new_node", color: "amber" }
    ]);

    // Move the node above the position visually
    const newNodeObj = nodes.pop()!;
    nodes.unshift(newNodeObj);
    
    push(4, `new_node.next = head`, `Gliding new node into position above the list.`, { [newNode]: "active", [head]: "key" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "new_node", index: newNode, label: "new_node", color: "amber" }
    ]);

    // Link it
    nodes.find(n => n.id === newNode)!.next = head;
    push(4, `new_node.next = head`, `Connecting new node to the old head.`, { [newNode]: "active", [head]: "key" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "new_node", index: newNode, label: "new_node", color: "amber" }
    ]);

    // Drop it in
    listArray.unshift(valToInsert);
    nodes.find(n => n.id === newNode)!.elevated = false;
    head = newNode;

    pushResult(5, `return new_node`, `Node dropped into place, new head established.`, head, [
      { id: "head", index: head, label: "head", color: "emerald" }
    ]);
    return steps;
  }

  push(3, `if pos == 0:`, `Position is not 0. Traversing list.`, {}, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" }
  ]);

  current = head;
  push(6, `current = head`, `Initializing traversal.`, { [current as number]: "active" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" },
    { id: "current", index: current, label: "current", color: "cyan" }
  ]);

  for (let i = 0; i < pos - 1; i++) {
    push(7, `for _ in range(pos - 1):`, `Checking if current is valid.`, { [current as number]: "compare" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "new_node", index: newNode, label: "new_node", color: "amber" },
      { id: "current", index: current, label: "current", color: "cyan" }
    ]);

    if (nodes.find(n => n.id === current)!.next === null) {
      push(8, `if not current: break`, `Reached end of list early.`, { [current as number]: "key" }, [
        { id: "head", index: head, label: "head", color: "emerald" },
        { id: "new_node", index: newNode, label: "new_node", color: "amber" },
        { id: "current", index: current, label: "current", color: "cyan" }
      ]);
      break;
    }
    
    current = nodes.find(n => n.id === current)!.next;
    push(9, `current = current.next`, `Advancing current pointer.`, { [current as number]: "active" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "new_node", index: newNode, label: "new_node", color: "amber" },
      { id: "current", index: current!, label: "current", color: "cyan" }
    ]);
  }

  push(7, `for _ in range(pos - 1):`, `Loop finished.`, { [current as number]: "key" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" },
    { id: "current", index: current!, label: "current", color: "cyan" }
  ]);

  // Elevate first!
  nodes.find(n => n.id === newNode)!.elevated = true;
  push(10, `new_node.next = current.next`, `Elevating new node before moving.`, { [newNode]: "active", [current as number]: "key" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" },
    { id: "current", index: current!, label: "current", color: "cyan" }
  ]);

  // Now, move the node above the correct position!
  const newNodeObj = nodes.pop()!;
  const currentIndexInArray = nodes.findIndex(n => n.id === current);
  nodes.splice(currentIndexInArray + 1, 0, newNodeObj);

  push(10, `new_node.next = current.next`, `Gliding new node above the correct position.`, { [newNode]: "active", [current as number]: "key" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" },
    { id: "current", index: current!, label: "current", color: "cyan" }
  ]);

  nodes.find(n => n.id === newNode)!.next = nodes.find(n => n.id === current)!.next;
  push(10, `new_node.next = current.next`, `Connecting newNode.next to the original next node.`, { [newNode]: "active", [current as number]: "key" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" },
    { id: "current", index: current!, label: "current", color: "cyan" }
  ]);

  nodes.find(n => n.id === current)!.next = newNode;
  push(11, `current.next = new_node`, `Redirecting current.next to the new node.`, { [current as number]: "active", [newNode]: "found" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" },
    { id: "current", index: current!, label: "current", color: "cyan" }
  ]);

  listArray.splice(pos, 0, valToInsert);
  // Drop it in
  nodes.find(n => n.id === newNode)!.elevated = false;
  
  push(11, `current.next = new_node`, `Dropping new node into place.`, { [current as number]: "active", [newNode]: "found" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" },
    { id: "current", index: current!, label: "current", color: "cyan" }
  ]);

  pushResult(12, `return head`, `Insertion complete.`, head, [
    { id: "head", index: head, label: "head", color: "emerald" }
  ]);

  return steps;
}

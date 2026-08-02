import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const linkedListInsertBeginningMeta: AlgorithmMeta = {
  id: "linked-list-insert-beginning",
  name: "Insert at Beginning",
  category: "Linked List",
  description: "Inserts a new node at the beginning of a linked list.",
  timeComplexity: {
    best: "Ω(1)",
    average: "Θ(1)",
    worst: "O(1)"
  },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def insertAtBeginning(head, val):",
    "    new_node = Node(val)",
    "    new_node.next = head",
    "    head = new_node",
    "    return head"
  ],
};

export function generateLinkedListInsertBeginningSteps(input: number[], target?: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  if (n === 0) return steps;

  const targetVal = target !== undefined ? target : 99;

  let nodes = input.map((val, idx) => ({ id: idx, val, next: idx < n - 1 ? idx + 1 : null }));
  let head: number | null = 0;
  let newNode: number | null = null;
  const newNodeId = n; // Use the next available ID for the new node
  
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

  // Step 1: initial call
  push(1, `insertAtBeginning(head, ${targetVal}) called`, `Creating new node.`, {}, [{ id: "head", index: head, label: "head", color: "emerald" }]);

  // Create new node
  newNode = newNodeId;
  nodes.unshift({ id: newNode, val: targetVal, next: null });
  
  push(2, `new_node = Node(${targetVal})`, `Linking new node to current head.`, { [newNode]: "active" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" }
  ]);

  // Link new_node to head
  nodes.find(n => n.id === newNode)!.next = head;
  listArray.unshift(targetVal);

  push(3, `new_node.next = head`, `Updating head pointer.`, { [newNode]: "active", [head]: "key" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "new_node", index: newNode, label: "new_node", color: "amber" }
  ]);

  // Update head
  head = newNode;
  
  push(4, `head = new_node`, `Returning new head.`, { [head]: "found" }, [
    { id: "head", index: head, label: "head", color: "emerald" }
  ]);

  pushResult(5, `return head`, `Insertion complete.`, head, [
    { id: "head", index: head, label: "head", color: "emerald" }
  ]);

  return steps;
}

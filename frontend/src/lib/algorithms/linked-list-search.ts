import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const linkedListSearchMeta: AlgorithmMeta = {
  id: "linked-list-search",
  name: "Search Linked List",
  category: "Linked List",
  description: "Searches for a target value in a linked list by sequentially checking each node.",
  timeComplexity: {
    best: "Ω(1)",
    average: "Θ(n)",
    worst: "O(n)"
  },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def searchLinkedList(head, target):",
    "    current = head",
    "    while current:",
    "        if current.data == target:",
    "            return True",
    "        current = current.next",
    "    return False"
  ],
};

export function generateLinkedListSearchSteps(input: number[], target?: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  
  if (n === 0) return steps;

  // Use a default target if none is provided
  const targetVal = target !== undefined ? target : (input.length > 0 ? input[Math.floor(input.length / 2)] : 5);

  const nodes = input.map((val, idx) => ({ id: idx, val, next: idx < n - 1 ? idx + 1 : null }));
  let current: number | null = null;
  const head = 0;
  let resultStr = "None";

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
      kind: "compare",
      description,
      nextHint,
      vars: {
        _nodes: { value: JSON.parse(JSON.stringify(nodes)), type: "list" },
        list: v("list", `[${input.join(", ")}]`, "list"),
        head: v("head", head, "int"),
        current: v("current", current !== null ? current : "None", "int"),
        target: v("target", targetVal, "int"),
        result: v("result", resultStr, "bool")
      },
      pointers,
    });
  };

  push(1, `searchLinkedList(head, target=${targetVal})`, `Setting current pointer to head.`, {}, [
    { id: "head", index: head, label: "head", color: "emerald" }
  ]);

  current = head;
  push(2, `current = head`, `Entering while loop to iterate over nodes.`, { [current]: "active" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" }
  ]);

  let found = false;

  while (current !== null) {
    push(3, `while current: (current = ${nodes[current].val})`, `Checking if current node's data matches target.`, { [current]: "active" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "current", index: current, label: "current", color: "cyan" }
    ]);

    push(4, `if current.data == target (${nodes[current].val} == ${targetVal})`, 
      nodes[current].val === targetVal ? `Match found! Returning True.` : `No match. Continuing to next node.`, 
      { [current]: "compare" }, 
      [
        { id: "head", index: head, label: "head", color: "emerald" },
        { id: "current", index: current, label: "current", color: "cyan" }
      ]
    );

    if (nodes[current].val === targetVal) {
      resultStr = "True";
      push(5, `return True`, `Target ${targetVal} was found in the linked list.`, { [current]: "found" }, [
        { id: "head", index: head, label: "head", color: "emerald" },
        { id: "current", index: current, label: "current", color: "cyan" }
      ]);
      found = true;
      break;
    }

    push(6, `current = current.next`, `Advancing current pointer to next node.`, { [current]: "active" }, [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "current", index: current, label: "current", color: "cyan" }
    ]);

    current = nodes[current].next;
  }

  if (!found) {
    resultStr = "False";
    push(7, `return False`, `Target ${targetVal} was not found in the linked list.`, {}, [
      { id: "head", index: head, label: "head", color: "emerald" }
    ]);
  }

  return steps;
}

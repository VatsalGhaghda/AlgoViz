import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const linkedListTraverseMeta: AlgorithmMeta = {
  id: "linked-list-traverse",
  name: "Traverse Linked List",
  category: "Linked List",
  description: "Traverses a linked list sequentially from the head to the end.",
  timeComplexity: {
    best: "Ω(1)",
    average: "Θ(n)",
    worst: "O(n)"
  },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def traverseLinkedList(head):",
    "    current = head",
    "    while current:",
    "        # Visit current.data",
    "        current = current.next"
  ],
};

export function generateLinkedListTraverseSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  
  if (n === 0) return steps;

  // Initial structure mapping
  const nodes = input.map((val, idx) => ({ id: idx, val, next: idx < n - 1 ? idx + 1 : null }));
  let current: number | null = null;
  const head = 0;

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
        list: v("list", `[${input.join(", ")}]`, "list"),
        head: v("head", head, "int"),
        current: v("current", current !== null ? current : "None", "int"),
        result: v("result", "None", "int"),
      },
      pointers,
    });
  };

  // Pre-visited nodes logic: to keep nodes green after visiting.
  const visited = new Set<number>();

  const getHighlights = (activeIdx: number | null): Record<number, HighlightState> => {
    const hl: Record<number, HighlightState> = {};
    for (const v of visited) {
      hl[v] = "visited";
    }
    if (activeIdx !== null) {
      hl[activeIdx] = "active"; // current visiting node
    }
    return hl;
  };

  push(1, `traverseLinkedList(head)`, `Setting current pointer to head.`, getHighlights(null), [
    { id: "head", index: head, label: "head", color: "emerald" }
  ]);

  current = head;
  push(2, `current = head`, `Entering while loop to iterate over nodes.`, getHighlights(current), [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "current", index: current, label: "current", color: "cyan" }
  ]);

  while (current !== null) {
    push(3, `while current: (current = ${nodes[current].val})`, `Visiting the current node.`, getHighlights(current), [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "current", index: current, label: "current", color: "cyan" }
    ]);

    visited.add(current);
    push(4, `# Visit current.data (${nodes[current].val})`, `Advancing current pointer to next node.`, getHighlights(current), [
      { id: "head", index: head, label: "head", color: "emerald" },
      { id: "current", index: current, label: "current", color: "cyan" }
    ]);

    current = nodes[current].next;
    push(5, `current = current.next`, current !== null ? `Continuing loop with next node.` : `Loop finishes as current is None.`, getHighlights(current), [
      { id: "head", index: head, label: "head", color: "emerald" },
      ...(current !== null ? [{ id: "current", index: current, label: "current", color: "cyan" }] : [])
    ]);
  }

  return steps;
}

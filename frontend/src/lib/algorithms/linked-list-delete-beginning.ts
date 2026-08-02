import type { VisualizationStep, AlgorithmMeta, HighlightState } from "@/types/visualization";

export const linkedListDeleteBeginningMeta: AlgorithmMeta = {
  id: "linked-list-delete-beginning",
  name: "Delete at Beginning",
  category: "Linked List",
  description: "Deletes the first node of a linked list.",
  timeComplexity: {
    best: "Ω(1)",
    average: "Θ(1)",
    worst: "O(1)"
  },
  spaceComplexity: "O(1)",
  language: "python",
  codeLines: [
    "def deleteAtBeginning(head):",
    "    if not head:",
    "        return None",
    "    temp = head",
    "    head = head.next",
    "    temp.next = None",
    "    del temp",
    "    return head"
  ],
};

export function generateLinkedListDeleteBeginningSteps(input: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = input.length;
  if (n === 0) return steps;

  let nodes = input.map((val, idx) => ({ id: idx, val, next: idx < n - 1 ? idx + 1 : null }));
  let head: number | null = 0;
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
        temp: v("temp", temp !== null ? temp : "None", "int"),
        result: v("result", resultValue !== null ? resultValue : "None", "int")
      },
      pointers,
    });
  };

  push(1, `deleteAtBeginning(head) called`, `Checking if head is null.`, {}, [{ id: "head", index: head, label: "head", color: "emerald" }]);

  push(2, `if not head:`, `Head is not null.`, {}, [
    { id: "head", index: head, label: "head", color: "emerald" }
  ]);

  temp = head;
  push(4, `temp = head`, `Storing current head in temp.`, { [temp]: "active" }, [
    { id: "head", index: head, label: "head", color: "emerald" },
    { id: "temp", index: temp, label: "temp", color: "amber" }
  ]);

  head = nodes[head].next;
  push(5, `head = head.next`, `Advancing head pointer.`, { [temp]: "key", ...(head !== null ? { [head]: "active" } : {}) }, [
    ...(head !== null ? [{ id: "head", index: head, label: "head", color: "emerald" }] : []),
    { id: "temp", index: temp, label: "temp", color: "amber" }
  ]);

  // Remove from our tracker
  listArray.shift();

  // We logically "delete" the node by removing its outgoing connection so it renders nicely disconnected or we just keep it but highlight it as red.
  // The viz component will render 'temp' if we pass it, but maybe we should sever its next pointer to show it's detached.
  nodes[temp].next = null;
  push(6, `temp.next = None`, `Severing the deleted node's next pointer.`, { [temp]: "error" }, [
    ...(head !== null ? [{ id: "head", index: head, label: "head", color: "emerald" }] : []),
    { id: "temp", index: temp, label: "temp", color: "amber" }
  ]);

  nodes = nodes.filter((n) => n.id !== temp);
  
  const deletedNode = temp;
  temp = null;
  push(7, `del temp`, `Deleting old head.`, { [deletedNode]: "error" }, [
    ...(head !== null ? [{ id: "head", index: head, label: "head", color: "emerald" }] : [])
  ]);

  // Clean it up from vars so it's formally gone, or leave it. Leaving it is fine as it's the last step basically.
  pushResult(8, `return head`, `Deletion complete.`, head, [
    ...(head !== null ? [{ id: "head", index: head, label: "head", color: "emerald" }] : [])
  ]);

  return steps;
}

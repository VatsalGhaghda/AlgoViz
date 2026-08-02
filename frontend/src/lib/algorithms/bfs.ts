import type { AlgorithmMeta, VisualizationStep, HighlightState } from "@/types/visualization";

export const bfsMeta: AlgorithmMeta = {
  id: "bfs",
  name: "Breadth First Search (Iterative)",
  category: "Graphs",
  description: "Traverses a graph level by level, exploring all neighbors of a node before moving to the next level.",
  timeComplexity: { best: "Ω(V+E)", average: "Θ(V+E)", worst: "O(V+E)" },
  spaceComplexity: "O(V)",
  language: "python",
  codeLines: [
    "def breadthFirstSearch(graph, start):",
    "    n = len(graph)",
    "    visited = [False] * n",
    "    queue = [start]",
    "    visited[start] = True",
    "    result = []",
    "",
    "    while queue:",
    "        current = queue.pop(0)",
    "        result.append(current)",
    "",
    "        for neighbor in graph[current]:",
    "            if not visited[neighbor]:",
    "                visited[neighbor] = True",
    "                queue.append(neighbor)",
    "",
    "    return result"
  ],
  graph: [[1, 2], [3, 4], [5], [5], [5], []],
  startNode: 0
};

export function generateBfsSteps(graphInput?: any, startNodeInput?: number): VisualizationStep[] {
  // If no graph provided, use default
  const graph = (graphInput && Array.isArray(graphInput) && Array.isArray(graphInput[0])) ? graphInput : bfsMeta.graph!;
  const startNode = startNodeInput ?? bfsMeta.startNode ?? 0;
  const n = graph.length;
  
  const steps: VisualizationStep[] = [];
  const visited = new Array(n).fill(false);
  const queue: number[] = [];
  const result: number[] = [];

  const push = (step: Omit<VisualizationStep, "data">) => {
    steps.push({ ...step, data: [] });
  };

  const getHighlights = (current: number | null, neighbor: number | null) => {
    const highlights: Record<number, HighlightState> = {};
    for (let i = 0; i < n; i++) {
      if (visited[i]) {
        if (result.includes(i)) highlights[i] = "visited"; // Green (fully processed)
        else if (queue.includes(i)) highlights[i] = "key"; // Amber (in queue)
      }
    }
    if (current !== null) highlights[current] = "current"; // Cyan (processing)
    if (neighbor !== null && !highlights[neighbor]) highlights[neighbor] = "compare"; // Optional neighbor highlight
    return highlights;
  };

  const treeEdges: string[] = [];
  const dashedEdges: string[] = [];

  push({
    highlights: getHighlights(null, null),
    line: 1,
    kind: "pass",
    description: `Calling breadthFirstSearch(graph, ${startNode}).`,
    nextHint: `Initializing visited array, queue, and result list.`,
    vars: {
      n: { value: n, type: "int" },
      treeEdges: { value: [...treeEdges], type: "list" },
      dashedEdges: { value: [...dashedEdges], type: "list" }
    },
    pointers: []
  });

  queue.push(startNode);
  visited[startNode] = true;

  push({
    highlights: getHighlights(null, null),
    line: 4,
    kind: "pass",
    description: `queue = [${startNode}]; visited[${startNode}] = True`,
    nextHint: `Entering while loop.`,
    vars: {
      queue: { value: [...queue], type: "list", changed: true },
      visited: { value: [...visited], type: "list", changed: true },
      treeEdges: { value: [...treeEdges], type: "list" },
      dashedEdges: { value: [...dashedEdges], type: "list" }
    },
    pointers: []
  });

  while (queue.length > 0) {
    push({
      highlights: getHighlights(null, null),
      line: 8,
      kind: "pass",
      description: `while queue is TRUE (queue is not empty).`,
      nextHint: `Polling current node from queue.`,
      vars: { 
        queue: { value: [...queue], type: "list" },
        treeEdges: { value: [...treeEdges], type: "list" },
        dashedEdges: { value: [...dashedEdges], type: "list" }
      },
      trajectory: [...result],
      pointers: []
    });

    const current = queue.shift()!;
    result.push(current);

    push({
      highlights: getHighlights(current, null),
      line: 9,
      kind: "pass",
      description: `current = ${current}; result.append(${current})`,
      nextHint: `Iterating over neighbors of ${current}.`,
      vars: { 
        current: { value: current, type: "int", changed: true },
        queue: { value: [...queue], type: "list", changed: true },
        result: { value: [...result], type: "list", changed: true },
        treeEdges: { value: [...treeEdges], type: "list" },
        dashedEdges: { value: [...dashedEdges], type: "list" }
      },
      trajectory: [...result],
      pointers: [{ id: "current", index: current, label: "current", color: "cyan" }]
    });

    for (const neighbor of graph[current]) {
      const edgeId = `${current}-${neighbor}`;

      push({
        highlights: getHighlights(current, neighbor),
        line: 12,
        kind: "pass",
        description: `for neighbor in graph[${current}] -> neighbor = ${neighbor}`,
        nextHint: `Checking if ${neighbor} is visited.`,
        vars: { 
          current: { value: current, type: "int" },
          queue: { value: [...queue], type: "list" },
          neighbor: { value: neighbor, type: "int", changed: true },
          currentEdge: { value: edgeId, type: "string" },
          treeEdges: { value: [...treeEdges], type: "list" },
          dashedEdges: { value: [...dashedEdges], type: "list" }
        },
        trajectory: [...result],
        pointers: [{ id: "current", index: current, label: "current", color: "cyan" }]
      });

      if (!visited[neighbor]) {
        visited[neighbor] = true;
        queue.push(neighbor);
        treeEdges.push(edgeId);

        push({
          highlights: getHighlights(current, neighbor),
          line: 14,
          kind: "pass",
          description: `visited[${neighbor}] is False. Marking as True and appending to queue.`,
          nextHint: `Continuing to next neighbor.`,
          vars: { 
            current: { value: current, type: "int" },
            neighbor: { value: neighbor, type: "int" },
            visited: { value: [...visited], type: "list", changed: true },
            queue: { value: [...queue], type: "list", changed: true },
            currentEdge: { value: edgeId, type: "string" },
            treeEdges: { value: [...treeEdges], type: "list", changed: true },
            dashedEdges: { value: [...dashedEdges], type: "list" }
          },
          trajectory: [...result],
          pointers: [{ id: "current", index: current, label: "current", color: "cyan" }]
        });
      } else {
        dashedEdges.push(edgeId);
        
        push({
          highlights: getHighlights(current, neighbor),
          line: 13,
          kind: "pass",
          description: `visited[${neighbor}] is True. Skipping.`,
          nextHint: `Continuing to next neighbor.`,
          vars: { 
            current: { value: current, type: "int" },
            queue: { value: [...queue], type: "list" },
            neighbor: { value: neighbor, type: "int" },
            currentEdge: { value: edgeId, type: "string" },
            treeEdges: { value: [...treeEdges], type: "list" },
            dashedEdges: { value: [...dashedEdges], type: "list", changed: true }
          },
          trajectory: [...result],
          pointers: [{ id: "current", index: current, label: "current", color: "cyan" }]
        });
      }
    }
  }

  push({
    highlights: getHighlights(null, null),
    line: 17,
    kind: "done",
    description: `Queue is empty. BFS complete!`,
    nextHint: `Returning result.`,
    vars: { 
      result: { value: [...result], type: "list" },
      queue: { value: [...queue], type: "list" },
      treeEdges: { value: [...treeEdges], type: "list" },
      dashedEdges: { value: [...dashedEdges], type: "list" }
    },
    trajectory: [...result],
    pointers: []
  });

  return steps;
}

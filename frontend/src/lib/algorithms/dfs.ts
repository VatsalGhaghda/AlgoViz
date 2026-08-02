import type { AlgorithmMeta, VisualizationStep, HighlightState } from "@/types/visualization";

export const dfsMeta: AlgorithmMeta = {
  id: "dfs",
  name: "Depth First Search (Iterative)",
  category: "Graphs",
  description: "Traverses a graph by exploring as far as possible along each branch before backtracking.",
  timeComplexity: { best: "Ω(V+E)", average: "Θ(V+E)", worst: "O(V+E)" },
  spaceComplexity: "O(V)",
  language: "python",
  codeLines: [
    "def depthFirstSearch(graph, start):",
    "    n = len(graph)",
    "    visited = [False] * n",
    "    stack = [start]",
    "    result = []",
    "",
    "    while stack:",
    "        current = stack.pop()",
    "",
    "        if visited[current]:",
    "            continue",
    "",
    "        visited[current] = True",
    "        result.append(current)",
    "",
    "        # Add neighbors in reverse order",
    "        for neighbor in reversed(graph[current]):",
    "            if not visited[neighbor]:",
    "                stack.append(neighbor)",
    "",
    "    return result"
  ],
  graph: [[1, 2], [3, 4], [5], [5], [5], []],
  startNode: 0
};

export function generateDfsSteps(graphInput?: any, startNodeInput?: number): VisualizationStep[] {
  const graph = (graphInput && Array.isArray(graphInput) && Array.isArray(graphInput[0])) ? graphInput : dfsMeta.graph!;
  const startNode = startNodeInput ?? dfsMeta.startNode ?? 0;
  const n = graph.length;
  
  const steps: VisualizationStep[] = [];
  const visited = new Array(n).fill(false);
  const stack: number[] = [];
  const result: number[] = [];

  const push = (step: Omit<VisualizationStep, "data">) => {
    steps.push({ ...step, data: [] });
  };

  const getHighlights = (current: number | null, neighbor: number | null) => {
    const highlights: Record<number, HighlightState> = {};
    for (let i = 0; i < n; i++) {
      if (visited[i]) {
        if (result.includes(i)) highlights[i] = "visited"; 
        else highlights[i] = "key"; 
      } else if (stack.includes(i)) {
        highlights[i] = "key"; // visually same as queued for stack elements
      }
    }
    if (current !== null) highlights[current] = "current"; 
    if (neighbor !== null && !highlights[neighbor]) highlights[neighbor] = "compare"; 
    return highlights;
  };

  const treeEdges: string[] = [];
  const dashedEdges: string[] = [];
  // Keep track of which edge was used to discover a node in the stack
  const parentEdge: Record<number, string> = {};

  push({
    highlights: getHighlights(null, null),
    line: 1,
    kind: "pass",
    description: `Calling depthFirstSearch(graph, ${startNode}).`,
    nextHint: `Initializing visited array, stack, and result list.`,
    vars: {
      n: { value: n, type: "int" },
      treeEdges: { value: [...treeEdges], type: "list" },
      dashedEdges: { value: [...dashedEdges], type: "list" }
    },
    pointers: []
  });

  stack.push(startNode);

  push({
    highlights: getHighlights(null, null),
    line: 4,
    kind: "pass",
    description: `stack = [${startNode}]`,
    nextHint: `Entering while loop.`,
    vars: {
      stack: { value: [...stack], type: "list", changed: true },
      visited: { value: [...visited], type: "list" },
      treeEdges: { value: [...treeEdges], type: "list" },
      dashedEdges: { value: [...dashedEdges], type: "list" }
    },
    pointers: []
  });

  while (stack.length > 0) {
    push({
      highlights: getHighlights(null, null),
      line: 7,
      kind: "pass",
      description: `while stack is TRUE (stack is not empty).`,
      nextHint: `Popping current node from stack.`,
      vars: { 
        stack: { value: [...stack], type: "list" },
        visited: { value: [...visited], type: "list" },
        treeEdges: { value: [...treeEdges], type: "list" },
        dashedEdges: { value: [...dashedEdges], type: "list" }
      },
      trajectory: [...result],
      pointers: []
    });

    const current = stack.pop()!;

    push({
      highlights: getHighlights(current, null),
      line: 8,
      kind: "pass",
      description: `current = ${current}`,
      nextHint: `Checking if ${current} is already visited.`,
      vars: { 
        current: { value: current, type: "int", changed: true },
        stack: { value: [...stack], type: "list", changed: true },
        visited: { value: [...visited], type: "list" },
        treeEdges: { value: [...treeEdges], type: "list" },
        dashedEdges: { value: [...dashedEdges], type: "list" }
      },
      trajectory: [...result],
      pointers: [{ id: "current", index: current, label: "current", color: "cyan" }]
    });

    push({
      highlights: getHighlights(current, null),
      line: 10,
      kind: "pass",
      description: `if visited[${current}] -> ${visited[current]}`,
      nextHint: visited[current] ? `Node already visited, skipping.` : `Marking node as visited.`,
      vars: { 
        current: { value: current, type: "int" },
        stack: { value: [...stack], type: "list" },
        visited: { value: [...visited], type: "list" },
        treeEdges: { value: [...treeEdges], type: "list" },
        dashedEdges: { value: [...dashedEdges], type: "list" }
      },
      trajectory: [...result],
      pointers: [{ id: "current", index: current, label: "current", color: "cyan" }]
    });

    if (visited[current]) {
      // If we popped a node that was already visited, the edge that led here was a back edge
      const edgeId = parentEdge[current];
      if (edgeId && !treeEdges.includes(edgeId) && !dashedEdges.includes(edgeId)) {
        dashedEdges.push(edgeId);
      }

      push({
        highlights: getHighlights(current, null),
        line: 11,
        kind: "pass",
        description: `continue to next iteration.`,
        nextHint: `Looping back.`,
        vars: { 
          current: { value: current, type: "int" },
          stack: { value: [...stack], type: "list" },
          visited: { value: [...visited], type: "list" },
          treeEdges: { value: [...treeEdges], type: "list" },
          dashedEdges: { value: [...dashedEdges], type: "list" }
        },
        trajectory: [...result],
        pointers: [{ id: "current", index: current, label: "current", color: "cyan" }]
      });
      continue;
    }

    visited[current] = true;
    result.push(current);

    // It's a successful visit, so the edge that got us here is a tree edge
    const edgeId = parentEdge[current];
    if (edgeId && !treeEdges.includes(edgeId)) {
      treeEdges.push(edgeId);
    }

    push({
      highlights: getHighlights(current, null),
      line: 13,
      kind: "pass",
      description: `visited[${current}] = True; result.append(${current})`,
      nextHint: `Iterating over neighbors of ${current} in reverse.`,
      vars: { 
        current: { value: current, type: "int" },
        stack: { value: [...stack], type: "list" },
        visited: { value: [...visited], type: "list", changed: true },
        result: { value: [...result], type: "list", changed: true },
        treeEdges: { value: [...treeEdges], type: "list" },
        dashedEdges: { value: [...dashedEdges], type: "list" }
      },
      trajectory: [...result],
      pointers: [{ id: "current", index: current, label: "current", color: "cyan" }]
    });

    const neighbors = [...graph[current]].reverse();

    for (const neighbor of neighbors) {
      const edgeId = `${current}-${neighbor}`;

      push({
        highlights: getHighlights(current, neighbor),
        line: 17,
        kind: "pass",
        description: `for neighbor in reversed(graph[${current}]) -> neighbor = ${neighbor}`,
        nextHint: `Checking if ${neighbor} is visited.`,
        vars: { 
          current: { value: current, type: "int" },
          stack: { value: [...stack], type: "list" },
          visited: { value: [...visited], type: "list" },
          neighbor: { value: neighbor, type: "int", changed: true },
          currentEdge: { value: edgeId, type: "string" },
          treeEdges: { value: [...treeEdges], type: "list" },
          dashedEdges: { value: [...dashedEdges], type: "list" }
        },
        trajectory: [...result],
        pointers: [{ id: "current", index: current, label: "current", color: "cyan" }]
      });

      push({
        highlights: getHighlights(current, neighbor),
        line: 18,
        kind: "pass",
        description: `if not visited[${neighbor}] -> ${!visited[neighbor]}`,
        nextHint: !visited[neighbor] ? `Appending to stack.` : `Neighbor already visited.`,
        vars: { 
          current: { value: current, type: "int" },
          stack: { value: [...stack], type: "list" },
          visited: { value: [...visited], type: "list" },
          neighbor: { value: neighbor, type: "int" },
          currentEdge: { value: edgeId, type: "string" },
          treeEdges: { value: [...treeEdges], type: "list" },
          dashedEdges: { value: [...dashedEdges], type: "list" }
        },
        trajectory: [...result],
        pointers: [{ id: "current", index: current, label: "current", color: "cyan" }]
      });

      if (!visited[neighbor]) {
        stack.push(neighbor);
        parentEdge[neighbor] = edgeId; // Update the discovering edge

        push({
          highlights: getHighlights(current, neighbor),
          line: 19,
          kind: "pass",
          description: `stack.append(${neighbor})`,
          nextHint: `Continuing to next neighbor.`,
          vars: { 
            current: { value: current, type: "int" },
            neighbor: { value: neighbor, type: "int" },
            visited: { value: [...visited], type: "list" },
            stack: { value: [...stack], type: "list", changed: true },
            currentEdge: { value: edgeId, type: "string" },
            treeEdges: { value: [...treeEdges], type: "list", changed: true },
            dashedEdges: { value: [...dashedEdges], type: "list" }
          },
          trajectory: [...result],
          pointers: [{ id: "current", index: current, label: "current", color: "cyan" }]
        });
      } else {
        // Only mark as dashed if it's not already a tree edge
        if (!treeEdges.includes(edgeId) && !dashedEdges.includes(edgeId)) {
          dashedEdges.push(edgeId);
        }
        
        push({
          highlights: getHighlights(current, neighbor),
          line: 18,
          kind: "pass",
          description: `Skipping already visited neighbor.`,
          nextHint: `Continuing to next neighbor.`,
          vars: { 
            current: { value: current, type: "int" },
            stack: { value: [...stack], type: "list" },
            visited: { value: [...visited], type: "list" },
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
    line: 21,
    kind: "done",
    description: `Stack is empty. DFS complete!`,
    nextHint: `Returning result.`,
    vars: { 
      result: { value: [...result], type: "list" },
      stack: { value: [...stack], type: "list" },
      visited: { value: [...visited], type: "list" },
      treeEdges: { value: [...treeEdges], type: "list" },
      dashedEdges: { value: [...dashedEdges], type: "list" }
    },
    trajectory: [...result],
    pointers: []
  });

  return steps;
}

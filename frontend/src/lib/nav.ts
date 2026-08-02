import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDown,
  Code2,
  GitBranch,
  Grid3x3,
  Link2,
  Network,
  Search,
  SlidersHorizontal,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  status: "ready" | "soon";
}

export interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    id: "python",
    label: "Python Playground",
    icon: Code2,
    description: "Write and visualize any Python code, step by step.",
    items: [
      { title: "Python Visualizer", href: "/python", icon: Code2, status: "ready" },
      { title: "Factorial (Recursion)", href: "/python?snippet=factorial", icon: Code2, status: "ready" },
      { title: "Fibonacci Sequence", href: "/python?snippet=fibonacci", icon: Code2, status: "ready" },
      { title: "Bubble Sort", href: "/python?snippet=bubble-sort", icon: Code2, status: "ready" },
      { title: "Binary Search", href: "/python?snippet=binary-search", icon: Code2, status: "ready" },
      { title: "Linked List", href: "/python?snippet=linked-list", icon: Code2, status: "ready" },
      { title: "Stack Ops", href: "/python?snippet=stack-ops", icon: Code2, status: "ready" },
    ],
  },
  {
    id: "sorting",
    label: "Sorting",
    icon: ArrowUpDown,
    description: "Algorithms for arranging data in a particular order.",
    items: [
      { title: "Bubble Sort", href: "/learn/sorting/bubble-sort", icon: SlidersHorizontal, status: "ready" },
      { title: "Quick Sort", href: "/learn/sorting/quick-sort", icon: SlidersHorizontal, status: "ready" },
      { title: "Merge Sort", href: "/learn/sorting/merge-sort", icon: SlidersHorizontal, status: "ready" },
      { title: "Selection Sort", href: "/learn/sorting/selection-sort", icon: SlidersHorizontal, status: "ready" },
      { title: "Insertion Sort", href: "/learn/sorting/insertion-sort", icon: SlidersHorizontal, status: "ready" },
    ],
  },
  {
    id: "arrays",
    label: "Arrays",
    icon: Grid3x3,
    description: "Fundamental contiguous memory data structures.",
    items: [
      { title: "Create", href: "/learn/arrays/array-create", icon: Grid3x3, status: "ready" },
      { title: "Traverse", href: "/learn/arrays/array-traverse", icon: Grid3x3, status: "ready" },
      { title: "Access by Index", href: "/learn/arrays/array-access", icon: Grid3x3, status: "ready" },
      { title: "Update Element", href: "/learn/arrays/array-update", icon: Grid3x3, status: "ready" },
      { title: "Insert at Beginning", href: "/learn/arrays/array-insert-beginning", icon: Grid3x3, status: "ready" },
      { title: "Insert at End", href: "/learn/arrays/array-insert-end", icon: Grid3x3, status: "ready" },
      { title: "Insert at Index", href: "/learn/arrays/array-insert-index", icon: Grid3x3, status: "ready" },
      { title: "Delete at Beginning", href: "/learn/arrays/array-delete-beginning", icon: Grid3x3, status: "ready" },
      { title: "Delete at End", href: "/learn/arrays/array-delete-end", icon: Grid3x3, status: "ready" },
      { title: "Delete at Index", href: "/learn/arrays/array-delete-index", icon: Grid3x3, status: "ready" },
      { title: "Reverse", href: "/learn/arrays/array-reverse", icon: Grid3x3, status: "ready" },
      { title: "Find Maximum", href: "/learn/arrays/array-find-max", icon: Grid3x3, status: "ready" },
      { title: "Find Minimum", href: "/learn/arrays/array-find-min", icon: Grid3x3, status: "ready" },
    ],
  },
  {
    id: "linked-list",
    label: "Linked Lists",
    icon: Link2,
    description: "Sequential node-based memory structures.",
    items: [
      { title: "Create", href: "/learn/linked-list/create", icon: Link2, status: "ready" },
      { title: "Traverse", href: "/learn/linked-list/traverse", icon: Link2, status: "ready" },
      { title: "Search", href: "/learn/linked-list/search", icon: Search, status: "ready" },
      { title: "Insert Beginning", href: "/learn/linked-list/insert-beginning", icon: Link2, status: "ready" },
      { title: "Insert End", href: "/learn/linked-list/insert-end", icon: Link2, status: "ready" },
      { title: "Insert Position", href: "/learn/linked-list/insert-position", icon: Link2, status: "ready" },
      { title: "Delete Beginning", href: "/learn/linked-list/delete-beginning", icon: Link2, status: "ready" },
      { title: "Delete End", href: "/learn/linked-list/delete-end", icon: Link2, status: "ready" },
      { title: "Delete Position", href: "/learn/linked-list/delete-position", icon: Link2, status: "ready" },
    ],
  },
  {
    id: "graphs",
    label: "Graphs",
    icon: Network,
    description: "Node and edge based relational structures.",
    items: [
      { title: "BFS", href: "/learn/graphs/bfs", icon: Network, status: "ready" },
      { title: "DFS", href: "/learn/graphs/dfs", icon: Network, status: "ready" },
      { title: "Dijkstra's", href: "/learn/graphs/dijkstra", icon: Network, status: "soon" },
    ],
  },
  {
    id: "stacks",
    label: "Stacks",
    icon: Grid3x3,
    description: "LIFO (Last-In-First-Out) data structures.",
    items: [
      { title: "Push", href: "/learn/stacks/stack-push", icon: Grid3x3, status: "ready" },
      { title: "Pop", href: "/learn/stacks/stack-pop", icon: Grid3x3, status: "ready" },
      { title: "Peek", href: "/learn/stacks/stack-peek", icon: Grid3x3, status: "ready" },
      { title: "isFull", href: "/learn/stacks/stack-is-full", icon: Grid3x3, status: "ready" },
      { title: "isEmpty", href: "/learn/stacks/stack-is-empty", icon: Grid3x3, status: "ready" },
    ],
  },
  {
    id: "queues",
    label: "Queues",
    icon: Grid3x3,
    description: "FIFO (First-In-First-Out) data structures.",
    items: [
      { title: "Enqueue", href: "/learn/queues/queue-enqueue", icon: Grid3x3, status: "ready" },
      { title: "Dequeue", href: "/learn/queues/queue-dequeue", icon: Grid3x3, status: "ready" },
      { title: "Peek", href: "/learn/queues/queue-peek", icon: Grid3x3, status: "ready" },
      { title: "Front", href: "/learn/queues/queue-front", icon: Grid3x3, status: "ready" },
      { title: "Rear", href: "/learn/queues/queue-rear", icon: Grid3x3, status: "ready" },
    ],
  },
  {
    id: "searching",
    label: "Searching",
    icon: Search,
    description: "Algorithms for finding elements within data structures.",
    items: [
      { title: "Linear Search", href: "/learn/searching/linear-search", icon: Search, status: "ready" },
      { title: "Binary Search", href: "/learn/searching/binary-search", icon: Search, status: "ready" },
    ],
  },
  {
    id: "trees",
    label: "Trees",
    icon: GitBranch,
    description: "Hierarchical data structures like BSTs.",
    items: [
      { title: "Overview", href: "/learn/trees/overview", icon: GitBranch, status: "soon" },
    ],
  },
];

export const allNavItems: NavItem[] = navSections.flatMap((s) => s.items);

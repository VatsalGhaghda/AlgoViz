import type { AlgorithmMeta, VisualizationStep } from "@/types/visualization";
import { bubbleSortMeta, generateBubbleSortSteps } from "./bubble-sort";
import { selectionSortMeta, generateSelectionSortSteps } from "./selection-sort";
import { insertionSortMeta, generateInsertionSortSteps } from "./insertion-sort";
import { mergeSortMeta, generateMergeSortSteps } from "./merge-sort";
import { quickSortMeta, generateQuickSortSteps } from "./quick-sort";
import { linearSearchMeta, generateLinearSearchSteps } from "./linear-search";
import { binarySearchMeta, generateBinarySearchSteps } from "./binary-search";
import { bfsMeta, generateBfsSteps } from "./bfs";
import { dfsMeta, generateDfsSteps } from "./dfs";
import { linkedListCreateMeta, generateLinkedListCreateSteps } from "./linked-list-create";
import { linkedListTraverseMeta, generateLinkedListTraverseSteps } from "./linked-list-traverse";
import { linkedListSearchMeta, generateLinkedListSearchSteps } from "./linked-list-search";
import { linkedListInsertBeginningMeta, generateLinkedListInsertBeginningSteps } from "./linked-list-insert-beginning";
import { linkedListInsertEndMeta, generateLinkedListInsertEndSteps } from "./linked-list-insert-end";
import { linkedListInsertPositionMeta, generateLinkedListInsertPositionSteps } from "./linked-list-insert-position";
import { linkedListDeleteBeginningMeta, generateLinkedListDeleteBeginningSteps } from "./linked-list-delete-beginning";
import { linkedListDeleteEndMeta, generateLinkedListDeleteEndSteps } from "./linked-list-delete-end";
import { linkedListDeletePositionMeta, generateLinkedListDeletePositionSteps } from "./linked-list-delete-position";
import { arrayCreateMeta, generateArrayCreateSteps } from "./array-create";
import { arrayTraverseMeta, generateArrayTraverseSteps } from "./array-traverse";
import { arrayAccessMeta, generateArrayAccessSteps } from "./array-access";
import { arrayUpdateMeta, generateArrayUpdateSteps } from "./array-update";
import { arrayInsertBeginningMeta, generateArrayInsertBeginningSteps } from "./array-insert-beginning";
import { arrayInsertEndMeta, generateArrayInsertEndSteps } from "./array-insert-end";
import { arrayInsertIndexMeta, generateArrayInsertIndexSteps } from "./array-insert-index";
import { arrayDeleteBeginningMeta, generateArrayDeleteBeginningSteps } from "./array-delete-beginning";
import { arrayDeleteEndMeta, generateArrayDeleteEndSteps } from "./array-delete-end";
import { arrayDeleteIndexMeta, generateArrayDeleteIndexSteps } from "./array-delete-index";
import { arrayReverseMeta, generateArrayReverseSteps } from "./array-reverse";
import { arrayFindMaxMeta, generateArrayFindMaxSteps } from "./array-find-max";
import { arrayFindMinMeta, generateArrayFindMinSteps } from "./array-find-min";

import { stackPushMeta, generateStackPushSteps } from "./stack-push";
import { stackPopMeta, generateStackPopSteps } from "./stack-pop";
import { stackPeekMeta, generateStackPeekSteps } from "./stack-peek";
import { stackIsFullMeta, generateStackIsFullSteps } from "./stack-is-full";
import { queueEnqueueMeta, generateQueueEnqueueSteps } from "./queue-enqueue";
import { queueDequeueMeta, generateQueueDequeueSteps } from "./queue-dequeue";
import { queuePeekMeta, generateQueuePeekSteps } from "./queue-peek";
import { queueFrontMeta, generateQueueFrontSteps } from "./queue-front";
import { queueRearMeta, generateQueueRearSteps } from "./queue-rear";
import { stackIsEmptyMeta, generateStackIsEmptySteps } from "./stack-is-empty";

export interface AlgorithmRegistryEntry {
  meta: AlgorithmMeta;
  generate: (input?: any, target?: number, value?: number) => VisualizationStep[];
}

export const ALGORITHM_REGISTRY: Record<string, AlgorithmRegistryEntry> = {
  "bubble-sort": {
    meta: bubbleSortMeta,
    generate: generateBubbleSortSteps,
  },
  "selection-sort": {
    meta: selectionSortMeta,
    generate: generateSelectionSortSteps,
  },
  "insertion-sort": {
    meta: insertionSortMeta,
    generate: generateInsertionSortSteps,
  },
  "merge-sort": {
    meta: mergeSortMeta,
    generate: generateMergeSortSteps,
  },
  "quick-sort": {
    meta: quickSortMeta,
    generate: generateQuickSortSteps,
  },
  "linear-search": { meta: linearSearchMeta, generate: generateLinearSearchSteps },
  "binary-search": { meta: binarySearchMeta, generate: generateBinarySearchSteps },
  "bfs": { meta: bfsMeta, generate: generateBfsSteps },
  "dfs": { meta: dfsMeta, generate: generateDfsSteps },
  "linked-list": { meta: linkedListCreateMeta, generate: generateLinkedListCreateSteps },
  "linked-list-create": { meta: linkedListCreateMeta, generate: generateLinkedListCreateSteps },
  "linked-list-traverse": { meta: linkedListTraverseMeta, generate: generateLinkedListTraverseSteps },
  "linked-list-search": { meta: linkedListSearchMeta, generate: generateLinkedListSearchSteps },
  "linked-list-insert-beginning": { meta: linkedListInsertBeginningMeta, generate: generateLinkedListInsertBeginningSteps },
  "linked-list-insert-end": { meta: linkedListInsertEndMeta, generate: generateLinkedListInsertEndSteps },
  "linked-list-insert-position": { meta: linkedListInsertPositionMeta, generate: generateLinkedListInsertPositionSteps },
  "linked-list-delete-beginning": { meta: linkedListDeleteBeginningMeta, generate: generateLinkedListDeleteBeginningSteps },
  "linked-list-delete-end": { meta: linkedListDeleteEndMeta, generate: generateLinkedListDeleteEndSteps },
  "linked-list-delete-position": { meta: linkedListDeletePositionMeta, generate: generateLinkedListDeletePositionSteps },
  "array-create": { meta: arrayCreateMeta, generate: generateArrayCreateSteps },
  "array-traverse": { meta: arrayTraverseMeta, generate: generateArrayTraverseSteps },
  "array-access": { meta: arrayAccessMeta, generate: generateArrayAccessSteps },
  "array-update": { meta: arrayUpdateMeta, generate: generateArrayUpdateSteps },
  "array-insert-beginning": { meta: arrayInsertBeginningMeta, generate: generateArrayInsertBeginningSteps },
  "array-insert-end": { meta: arrayInsertEndMeta, generate: generateArrayInsertEndSteps },
  "array-insert-index": { meta: arrayInsertIndexMeta, generate: generateArrayInsertIndexSteps },
  "array-delete-beginning": { meta: arrayDeleteBeginningMeta, generate: generateArrayDeleteBeginningSteps },
  "array-delete-end": { meta: arrayDeleteEndMeta, generate: generateArrayDeleteEndSteps },
  "array-delete-index": { meta: arrayDeleteIndexMeta, generate: generateArrayDeleteIndexSteps },
  "array-reverse": { meta: arrayReverseMeta, generate: generateArrayReverseSteps },
  "array-find-max": { meta: arrayFindMaxMeta, generate: generateArrayFindMaxSteps },
  "array-find-min": { meta: arrayFindMinMeta, generate: generateArrayFindMinSteps },
  
  "stack-push": { meta: stackPushMeta, generate: generateStackPushSteps },
  "stack-pop": { meta: stackPopMeta, generate: generateStackPopSteps },
  "stack-peek": { meta: stackPeekMeta, generate: generateStackPeekSteps },
  "stack-is-full": { meta: stackIsFullMeta, generate: generateStackIsFullSteps },
  "stack-is-empty": { meta: stackIsEmptyMeta, generate: generateStackIsEmptySteps },
  
  "queue-enqueue": { meta: queueEnqueueMeta, generate: generateQueueEnqueueSteps },
  "queue-dequeue": { meta: queueDequeueMeta, generate: generateQueueDequeueSteps },
  "queue-peek": { meta: queuePeekMeta, generate: generateQueuePeekSteps },
  "queue-front": { meta: queueFrontMeta, generate: generateQueueFrontSteps },
  "queue-rear": { meta: queueRearMeta, generate: generateQueueRearSteps },
};

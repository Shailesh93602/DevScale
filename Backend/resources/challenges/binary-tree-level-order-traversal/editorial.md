# Editorial — Binary Tree Level Order Traversal

## Approach: BFS with Queue (O(N) Time, O(N) Space)

Level order traversal is textbook BFS. We use a queue to process nodes layer by layer.

The key trick is figuring out which nodes belong to the same level. Before we start processing a level, we snapshot the **current queue size**. That tells us exactly how many nodes are in the current level. We process exactly that many nodes, collects their values, and enqueue their children. Those children are the next level — and when we start the next iteration, the queue size will tell us how many nodes are in that next level!

```typescript
function levelOrder(root: TreeNode | null): number[][] {
  const result: number[][] = [];
  if (root === null) return result;

  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    // Snapshot the size of the current level
    const levelSize = queue.length;
    const levelValues: number[] = [];

    // Process exactly 'levelSize' nodes — all belong to the current level
    for (let i = 0; i < levelSize; i++) {
      const current = queue.shift()!;
      levelValues.push(current.val);

      // Enqueue children — these belong to the NEXT level
      if (current.left !== null) queue.push(current.left);
      if (current.right !== null) queue.push(current.right);
    }

    result.push(levelValues);
  }

  return result;
}
```

**Complexity:**
- **Time Complexity:** **O(N)**. Every node is enqueued and dequeued exactly once.
- **Space Complexity:** **O(N)**. In the worst case (a perfectly balanced tree), the queue holds all nodes of the last level, which is $N/2$ nodes. The result array also holds all $N$ values.

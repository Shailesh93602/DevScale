# Editorial — Binary Tree Right Side View

## Approach: BFS — Take Last Node Per Level (O(N) Time, O(N) Space)

The key insight: "what you see from the right side" is simply **the last node on each level** when doing a level-order traversal.

We do BFS. For each level, we know exactly how many nodes it contains (the queue size before processing starts). We process all nodes in the level, and only record the value of the **last** node we process (`i === levelSize - 1`).

```typescript
function rightSideView(root: TreeNode | null): number[] {
  const result: number[] = [];
  if (root === null) return result;

  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;

    for (let i = 0; i < levelSize; i++) {
      const current = queue.shift()!;

      if (i === levelSize - 1) {
        result.push(current.val); // Last node at this level
      }

      if (current.left !== null) queue.push(current.left);
      if (current.right !== null) queue.push(current.right);
    }
  }

  return result;
}
```

**Complexity:**
- **Time Complexity:** **O(N)**. Every node is enqueued and dequeued exactly once.
- **Space Complexity:** **O(N)**. The queue will store at most all nodes from the widest level of the tree.

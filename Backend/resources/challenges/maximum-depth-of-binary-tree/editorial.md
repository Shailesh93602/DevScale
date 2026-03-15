# Editorial — Maximum Depth of Binary Tree

## Approach 1: Recursive Depth-First Search (DFS) (O(N) Time, O(H) Space)

The recursive approach is often the easiest to write for tree problems. 
Think about what the "maximum depth" of a node is. It is simply $1$ (for the current node itself) plus the maximum depth of its left subtree or its right subtree, whichever is larger!

If the node is `null`, its depth is exactly `0`.

```typescript
function maxDepth(root: TreeNode | null): number {
  if (root === null) {
      return 0;
  }
  
  // Find the depth of the left subtree
  const leftDepth = maxDepth(root.left);
  // Find the depth of the right subtree
  const rightDepth = maxDepth(root.right);
  
  // The max depth is 1 (for the current root) + the larger of the two subtrees
  return 1 + Math.max(leftDepth, rightDepth);
}
```

This can be shortened to a very elegant one-liner:
```typescript
function maxDepth(root: TreeNode | null): number {
  return root ? 1 + Math.max(maxDepth(root.left), maxDepth(root.right)) : 0;
}
```

**Complexity:**
- **Time Complexity:** **O(N)**. We visit every single node in the tree exactly once.
- **Space Complexity:** **O(H)** where $H$ is the height of the tree. This accounts for the recursive call stack. In the worst case (a completely unbalanced tree), to $O(N)$. In the best case (a perfectly balanced tree), $O(\log N)$.

---

## Approach 2: Iterative Breadth-First Search (BFS) (O(N) Time, O(N) Space)

Sometimes an iterative approach using a queue is preferred to prevent call-stack overflows on extremely deep, unbalanced trees.

We use a queue to traverse the tree layer by layer (level order traversal). We simply count how many layers we process.

```typescript
function maxDepth(root: TreeNode | null): number {
  if (root === null) return 0;

  const queue: TreeNode[] = [root];
  let depth = 0;

  while (queue.length > 0) {
    const levelSize = queue.length;
    depth++;

    // Process all nodes at the current depth level
    for (let i = 0; i < levelSize; i++) {
      const current = queue.shift()!;
      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }
  }

  return depth;
}
```

**Complexity:**
- **Time Complexity:** **O(N)**. Every node is added to and removed from the queue exactly once.
- **Space Complexity:** **O(N)**. The queue will store at most the lowest level of nodes, which is completely full for a balanced tree, containing $N/2$ nodes.

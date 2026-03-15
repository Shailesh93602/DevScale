# Editorial — Count Good Nodes in Binary Tree

## Approach: DFS with Maximum Path Tracking (O(N) Time, O(H) Space)

A node is "good" if its value is ≥ the maximum value seen on the path from the root to that node.

We do a DFS and pass the current maximum value (`maxSoFar`) as a parameter down the recursion. At each node:
1. If `node.val >= maxSoFar`, it's a good node — increment count by 1.
2. Update `maxSoFar = max(maxSoFar, node.val)` before recursing into children.
3. Recursively count good nodes in the left and right subtrees.

```typescript
function goodNodes(root: TreeNode): number {
  function dfs(node: TreeNode | null, maxSoFar: number): number {
    if (node === null) return 0;

    let count = node.val >= maxSoFar ? 1 : 0;
    const newMax = Math.max(maxSoFar, node.val);

    count += dfs(node.left, newMax);
    count += dfs(node.right, newMax);

    return count;
  }

  return dfs(root, -Infinity);
}
```

**Complexity:**
- **Time Complexity:** **O(N)**. Every node is visited exactly once.
- **Space Complexity:** **O(H)** for the recursive call stack where H is the height of the tree.

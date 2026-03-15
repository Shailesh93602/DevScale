# Editorial — Diameter of Binary Tree

## Approach: Post-order DFS with Global Max (O(N) Time, O(H) Space)

The diameter through any node is the sum of heights of its left and right subtrees. We need to find the maximum of this across all nodes.

We compute the **height** of each subtree using a post-order DFS. At every node, we update a global `maxDiameter` with `leftHeight + rightHeight`, then return `1 + max(leftHeight, rightHeight)` as the current node's contribution to its parent's height calculation.

```typescript
function diameterOfBinaryTree(root: TreeNode | null): number {
  let maxDiameter = 0;

  function height(node: TreeNode | null): number {
    if (node === null) return 0;

    const leftH = height(node.left);
    const rightH = height(node.right);

    maxDiameter = Math.max(maxDiameter, leftH + rightH);
    return 1 + Math.max(leftH, rightH);
  }

  height(root);
  return maxDiameter;
}
```

**Complexity:**
- **Time:** **O(N)** — every node visited once.
- **Space:** **O(H)** — call stack depth.

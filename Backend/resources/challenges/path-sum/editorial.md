# Editorial — Path Sum

## Approach: Recursive DFS (O(N) Time, O(H) Space)

At each node, subtract its value from `targetSum`. When we reach a **leaf**, check if the remaining value is exactly 0 (meaning the path sum matched `targetSum`). If the root is null, return false.

```typescript
function hasPathSum(root: TreeNode | null, targetSum: number): boolean {
  if (root === null) return false;

  if (root.left === null && root.right === null) {
    return root.val === targetSum;
  }

  return (
    hasPathSum(root.left, targetSum - root.val) ||
    hasPathSum(root.right, targetSum - root.val)
  );
}
```

**Complexity:**
- **Time:** **O(N)** — every node visited once.
- **Space:** **O(H)** — call stack depth; O(N) worst case for skewed trees.

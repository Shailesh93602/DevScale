# Editorial — Count Complete Tree Nodes

## Approach: O(log²N) using Complete Tree Property

A **naive** O(N) DFS would work, but the problem asks for better. We leverage the complete binary tree guarantee.

**Key insight:** Compute the height going all the way **left** (`leftH`) and all the way **right** (`rightH`):
- If `leftH === rightH` → this is a **perfect** binary tree, so nodes = `2^h - 1`. Return immediately.
- If `leftH !== rightH` → the last level is incomplete. Recurse into both children.

Since the recursion only goes down the unbalanced side, we get O(log N) levels, each costing O(log N) to compute height → **O(log² N) total**.

```typescript
function countNodes(root: TreeNode | null): number {
  if (root === null) return 0;

  let leftH = 0, rightH = 0;
  let left: TreeNode | null = root;
  let right: TreeNode | null = root;

  while (left !== null) { leftH++; left = left.left; }
  while (right !== null) { rightH++; right = right.right; }

  if (leftH === rightH) return (1 << leftH) - 1; // 2^h - 1

  return 1 + countNodes(root.left) + countNodes(root.right);
}
```

**Complexity:**
- **Time:** **O(log² N)** — O(log N) recursion depth, each level costs O(log N) to compute heights.
- **Space:** **O(log N)** — call stack depth.

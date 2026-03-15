# Editorial — Balanced Binary Tree

## Key Insight

A binary tree is balanced if, for every node, the heights of its left and right subtrees differ by at most 1. The trick is to compute the height and check balance simultaneously in a single pass.

---

## Approach 1: Top-Down Recursion (O(N log N) Time, O(N) Space)

The simplest approach: for each node, compute the height of the left and right subtrees, check the difference, then recursively verify that both subtrees are also balanced.

This is intuitive but inefficient because `height()` is called repeatedly on the same nodes.

```typescript
function height(node: TreeNode | null): number {
  if (node === null) return 0;
  return 1 + Math.max(height(node.left), height(node.right));
}

function isBalanced(root: TreeNode | null): boolean {
  if (root === null) return true;

  const leftH = height(root.left);
  const rightH = height(root.right);

  if (Math.abs(leftH - rightH) > 1) return false;

  return isBalanced(root.left) && isBalanced(root.right);
}
```

**Complexity:**
- **Time:** O(N log N) — height is O(N) and called at each level, with O(log N) levels for a balanced tree.
- **Space:** O(N) — recursion stack in the worst case (skewed tree).

---

## Approach 2: Bottom-Up Recursion (O(N) Time, O(N) Space) — Optimal

Instead of computing height and checking balance separately, we do both in one traversal. We return `-1` as a sentinel to indicate an unbalanced subtree, which allows early termination.

```typescript
function isBalanced(root: TreeNode | null): boolean {
  function checkHeight(node: TreeNode | null): number {
    if (node === null) return 0;

    const leftH = checkHeight(node.left);
    if (leftH === -1) return -1; // Left subtree unbalanced

    const rightH = checkHeight(node.right);
    if (rightH === -1) return -1; // Right subtree unbalanced

    if (Math.abs(leftH - rightH) > 1) return -1; // Current node unbalanced

    return 1 + Math.max(leftH, rightH);
  }

  return checkHeight(root) !== -1;
}
```

**Complexity:**
- **Time:** O(N) — each node is visited exactly once.
- **Space:** O(H) where H is the height of the tree. O(N) in the worst case (skewed), O(log N) for balanced trees.

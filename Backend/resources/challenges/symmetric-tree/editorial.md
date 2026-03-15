# Editorial — Symmetric Tree

## Approach: Recursive Mirror Check (O(N) Time, O(H) Space)

A tree is symmetric if its left subtree is a **mirror** of its right subtree. We write a helper `isMirror(left, right)` that checks if two trees are mirrors:
- Both null → `true`
- One null → `false`
- Values differ → `false`
- Recursively: `left.left` mirrors `right.right` AND `left.right` mirrors `right.left`

```typescript
function isSymmetric(root: TreeNode | null): boolean {
  function isMirror(left: TreeNode | null, right: TreeNode | null): boolean {
    if (!left && !right) return true;
    if (!left || !right) return false;
    if (left.val !== right.val) return false;
    return isMirror(left.left, right.right) && isMirror(left.right, right.left);
  }
  return isMirror(root?.left ?? null, root?.right ?? null);
}
```

**Complexity:**
- **Time:** **O(N)** — every node visited once.
- **Space:** **O(H)** — call stack depth.

# Editorial — Validate Binary Search Tree

## Approach: DFS with Valid Range (O(N) Time, O(H) Space)

The key insight that many people miss: checking only if `node.left.val < node.val < node.right.val` is **not enough**. A left subtree node deep in the tree could violate the global BST constraint even if it satisfies its local parent.

The correct approach is to carry a `[min, max]` range with each node as we recurse. The node's value must strictly satisfy `min < node.val < max`.

- Root starts with range `(-Infinity, +Infinity)`.
- When we go **left**, the new max becomes `node.val` (left subtree values must be < parent).
- When we go **right**, the new min becomes `node.val` (right subtree values must be > parent).

```typescript
function isValidBST(root: TreeNode | null): boolean {
  function validate(node: TreeNode | null, min: number, max: number): boolean {
    if (node === null) return true;

    // Value must be strictly within (min, max)
    if (node.val <= min || node.val >= max) return false;

    // Recurse — left subtree max is the current node's value
    // Right subtree min is the current node's value
    return (
      validate(node.left, min, node.val) &&
      validate(node.right, node.val, max)
    );
  }

  return validate(root, -Infinity, Infinity);
}
```

**Complexity:**
- **Time Complexity:** **O(N)**. Every node is visited exactly once.
- **Space Complexity:** **O(H)** where H is the height of the tree, due to the recursive call stack.

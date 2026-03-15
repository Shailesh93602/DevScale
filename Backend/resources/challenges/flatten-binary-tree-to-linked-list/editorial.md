# Editorial — Flatten Binary Tree to Linked List

## Approach: Iterative Morris-style (O(N) Time, O(1) Space)

For each node, if it has a left child:
1. Find the **rightmost node** of the left subtree.
2. Wire that rightmost node's `right` pointer to the current node's `right` child.
3. Move the entire left subtree to the right (`curr.right = curr.left`).
4. Set `curr.left = null`.
5. Advance to `curr.right`.

This effectively inserts the left subtree between the current node and its right subtree in pre-order.

```typescript
function flatten(root: TreeNode | null): void {
  let curr = root;

  while (curr !== null) {
    if (curr.left !== null) {
      let rightmost = curr.left;
      while (rightmost.right !== null) {
        rightmost = rightmost.right;
      }

      rightmost.right = curr.right;
      curr.right = curr.left;
      curr.left = null;
    }

    curr = curr.right;
  }
}
```

**Complexity:**
- **Time:** **O(N)** — each node is visited at most twice (once as `curr`, once as `rightmost`).
- **Space:** **O(1)** — fully in-place, no recursion stack.

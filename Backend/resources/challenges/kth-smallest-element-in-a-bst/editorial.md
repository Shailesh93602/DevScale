# Editorial — Kth Smallest Element in a BST

## Approach: Iterative In-Order Traversal (O(H + k) Time, O(H) Space)

The key property of a BST is that an **in-order traversal** (left → root → right) produces values in **ascending sorted order**.

So the kth smallest element is simply the kth element encountered during an in-order traversal!

We use an iterative approach with a stack. We don't need to traverse the entire tree — we can stop as soon as we've processed exactly `k` nodes.

```typescript
function kthSmallest(root: TreeNode | null, k: number): number {
  const stack: TreeNode[] = [];
  let curr: TreeNode | null = root;

  while (curr !== null || stack.length > 0) {
    // Go as far left as possible (these are the smallest values)
    while (curr !== null) {
      stack.push(curr);
      curr = curr.left;
    }

    // Pop — this is the next smallest node
    curr = stack.pop()!;
    k--;

    // If k is now 0, we found our answer!
    if (k === 0) return curr.val;

    // Move to right subtree to continue in-order
    curr = curr.right;
  }

  return -1;
}
```

**Complexity:**
- **Time Complexity:** **O(H + k)** where $H$ is the tree height. In the worst case (unbalanced tree), this is $O(N)$.
- **Space Complexity:** **O(H)** for the stack.

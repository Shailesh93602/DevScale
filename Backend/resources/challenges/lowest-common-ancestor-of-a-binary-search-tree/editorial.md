# Editorial — Lowest Common Ancestor of a Binary Search Tree

## Approach 1: Iterative (O(H) Time, O(1) Space)

The key insight in this problem is leveraging the **BST property**: for any node, all values in its left subtree are smaller, and all values in its right subtree are larger.

We start at the root and navigate down towards the answer:
- If **both** `p.val` and `q.val` are **less than** `root.val`, then the LCA must be in the **left subtree**. Move `root = root.left`.
- If **both** `p.val` and `q.val` are **greater than** `root.val`, then the LCA must be in the **right subtree**. Move `root = root.right`.
- Otherwise, the current `root` is the **split point** — one of `p` or `q` is on each side (or one of them IS `root`). This current node is the LCA!

```typescript
function lowestCommonAncestor(
  root: TreeNode | null,
  p: TreeNode | null,
  q: TreeNode | null
): TreeNode | null {
  let node = root;

  while (node !== null) {
    if (p!.val < node.val && q!.val < node.val) {
      // Both nodes are in the left subtree
      node = node.left;
    } else if (p!.val > node.val && q!.val > node.val) {
      // Both nodes are in the right subtree
      node = node.right;
    } else {
      // We've found the split point — this is the LCA
      return node;
    }
  }

  return null;
}
```

**Complexity:**
- **Time Complexity:** **O(H)** where $H$ is the height of the tree. For a balanced BST this is $O(\log N)$, worst case $O(N)$.
- **Space Complexity:** **O(1)** — purely iterative, no extra data structures needed.

---

## Approach 2: Recursive (O(H) Time, O(H) Space)

The exact same logic can be expressed recursively:

```typescript
function lowestCommonAncestor(
  root: TreeNode | null,
  p: TreeNode | null,
  q: TreeNode | null
): TreeNode | null {
  if (root === null) return null;

  if (p!.val < root.val && q!.val < root.val) {
    return lowestCommonAncestor(root.left, p, q);
  }

  if (p!.val > root.val && q!.val > root.val) {
    return lowestCommonAncestor(root.right, p, q);
  }

  return root;
}
```

**Complexity:**
- **Time Complexity:** **O(H)**
- **Space Complexity:** **O(H)** due to the recursive call stack.

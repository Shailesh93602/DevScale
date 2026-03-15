# Editorial — Inorder Successor in BST

## Key Insight

The in-order successor is the node with the smallest value strictly greater than `p.val`. In a BST, we can leverage the ordering property: if the current node's value is greater than `p.val`, it could be the successor, and we search left to find a closer one. Otherwise, we search right.

---

## Approach 1: BST Search (O(H) Time, O(1) Space) — Optimal

Use the BST property to narrow down the search. Maintain a candidate successor and update it whenever we find a node whose value is greater than `p.val`.

```typescript
function inorderSuccessor(root: TreeNode | null, p: TreeNode): TreeNode | null {
  let successor: TreeNode | null = null;
  let current = root;

  while (current !== null) {
    if (current.val > p.val) {
      successor = current; // This could be the successor
      current = current.left; // Try to find a closer (smaller) successor
    } else {
      current = current.right; // Need a larger value
    }
  }

  return successor;
}
```

**Complexity:**
- **Time:** O(H) where H is the height of the tree.
- **Space:** O(1) — no extra space.

---

## Approach 2: In-Order Traversal (O(N) Time, O(H) Space)

Perform a full in-order traversal and return the first node whose value is greater than `p.val`. This works but is less efficient than leveraging the BST property.

```typescript
function inorderSuccessor(root: TreeNode | null, p: TreeNode): TreeNode | null {
  const stack: TreeNode[] = [];
  let current = root;
  let foundP = false;

  while (current !== null || stack.length > 0) {
    while (current !== null) {
      stack.push(current);
      current = current.left;
    }

    current = stack.pop()!;

    if (foundP) return current;
    if (current === p) foundP = true;

    current = current.right;
  }

  return null;
}
```

**Complexity:**
- **Time:** O(N) in the worst case.
- **Space:** O(H) for the stack.

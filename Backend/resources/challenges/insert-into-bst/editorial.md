# Editorial — Insert into a Binary Search Tree

## Key Insight

Inserting into a BST always adds a new leaf node. We traverse the tree following the BST property (go left if val is smaller, go right if val is larger) until we find an empty spot.

---

## Approach 1: Recursive (O(H) Time, O(H) Space)

Recursively traverse the tree. When we reach a null node, create a new node with the value.

```typescript
function insertIntoBST(root: TreeNode | null, val: number): TreeNode | null {
  if (root === null) return new TreeNode(val);

  if (val < root.val) {
    root.left = insertIntoBST(root.left, val);
  } else {
    root.right = insertIntoBST(root.right, val);
  }

  return root;
}
```

**Complexity:**
- **Time:** O(H) where H is the height of the tree.
- **Space:** O(H) — recursion stack.

---

## Approach 2: Iterative (O(H) Time, O(1) Space)

Use a loop to find the correct parent node, then attach the new node.

```typescript
function insertIntoBST(root: TreeNode | null, val: number): TreeNode | null {
  const newNode = new TreeNode(val);
  if (root === null) return newNode;

  let current = root;
  while (true) {
    if (val < current.val) {
      if (current.left === null) {
        current.left = newNode;
        return root;
      }
      current = current.left;
    } else {
      if (current.right === null) {
        current.right = newNode;
        return root;
      }
      current = current.right;
    }
  }
}
```

**Complexity:**
- **Time:** O(H) where H is the height of the tree.
- **Space:** O(1) — no recursion.

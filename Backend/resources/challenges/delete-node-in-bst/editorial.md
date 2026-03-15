# Editorial — Delete Node in a BST

## Key Insight

Deleting a node from a BST has three cases:
1. **Leaf node:** Simply remove it.
2. **One child:** Replace the node with its child.
3. **Two children:** Replace the node's value with its in-order successor (smallest node in the right subtree), then delete the successor.

---

## Approach 1: Recursive (O(H) Time, O(H) Space)

Recursively search for the key, then handle the three deletion cases.

```typescript
function deleteNode(root: TreeNode | null, key: number): TreeNode | null {
  if (root === null) return null;

  if (key < root.val) {
    root.left = deleteNode(root.left, key);
  } else if (key > root.val) {
    root.right = deleteNode(root.right, key);
  } else {
    // Found the node to delete
    // Case 1 & 2: No left child or no right child
    if (root.left === null) return root.right;
    if (root.right === null) return root.left;

    // Case 3: Two children — find in-order successor
    let successor = root.right;
    while (successor.left !== null) {
      successor = successor.left;
    }

    // Replace value with successor's value
    root.val = successor.val;
    // Delete the successor from right subtree
    root.right = deleteNode(root.right, successor.val);
  }

  return root;
}
```

**Complexity:**
- **Time:** O(H) where H is the height of the tree.
- **Space:** O(H) — recursion stack.

---

## Approach 2: Iterative (O(H) Time, O(1) Space)

Iteratively find the node, then handle deletion without recursion. This is more complex but uses constant space.

```typescript
function deleteNode(root: TreeNode | null, key: number): TreeNode | null {
  let parent: TreeNode | null = null;
  let current = root;

  // Find the node to delete
  while (current !== null && current.val !== key) {
    parent = current;
    if (key < current.val) current = current.left;
    else current = current.right;
  }

  if (current === null) return root; // Key not found

  // Case: two children
  if (current.left !== null && current.right !== null) {
    let succParent = current;
    let succ = current.right;
    while (succ.left !== null) {
      succParent = succ;
      succ = succ.left;
    }
    current.val = succ.val;
    // Now delete the successor
    parent = succParent;
    current = succ;
  }

  // Case: zero or one child
  const child = current.left !== null ? current.left : current.right;

  if (parent === null) return child; // Deleting root

  if (parent.left === current) parent.left = child;
  else parent.right = child;

  return root;
}
```

**Complexity:**
- **Time:** O(H).
- **Space:** O(1).

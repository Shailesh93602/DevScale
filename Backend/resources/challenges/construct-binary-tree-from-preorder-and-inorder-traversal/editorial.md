# Editorial — Construct Binary Tree from Preorder and Inorder Traversal

## Approach: Divide and Conquer with HashMap (O(N) Time, O(N) Space)

**Key Observations:**
1. In **preorder** traversal `[root, left..., right...]` — the **first element is always the root**.
2. In **inorder** traversal `[left..., root, right...]` — once we find the root, everything to its **left** belongs to the left subtree and everything to its **right** belongs to the right subtree.

**Algorithm:**
1. Build a HashMap: `value → index in inorder` for O(1) lookup.
2. Maintain a global `preorderIdx` pointer.
3. Recursively build with `build(left, right)` where `[left, right]` is the valid inorder range:
   - Take the next `preorder[preorderIdx++]` as the root.
   - Find its index in inorder using the HashMap.
   - Build the left subtree using range `[left, rootInorderIdx - 1]`.
   - Build the right subtree using range `[rootInorderIdx + 1, right]`.
   - Return the root.

```typescript
function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
  const inorderIdx = new Map<number, number>();
  for (let i = 0; i < inorder.length; i++) {
    inorderIdx.set(inorder[i], i);
  }

  let pre = 0;

  function build(left: number, right: number): TreeNode | null {
    if (left > right) return null;

    const rootVal = preorder[pre++];
    const root = new TreeNode(rootVal);
    const mid = inorderIdx.get(rootVal)!;

    root.left = build(left, mid - 1);
    root.right = build(mid + 1, right);

    return root;
  }

  return build(0, inorder.length - 1);
}
```

**Complexity:**
- **Time Complexity:** **O(N)**. Each node is created exactly once and each HashMap lookup is O(1).
- **Space Complexity:** **O(N)** for the HashMap and the recursion call stack.

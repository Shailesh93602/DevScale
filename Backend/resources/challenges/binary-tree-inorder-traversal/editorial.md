# Editorial — Binary Tree Inorder Traversal

### Recursive Approach
The recursive approach is straightforward: traverse the left subtree, visit the root, and then traverse the right subtree.
```typescript
function traverse(node, result) {
    if (!node) return;
    traverse(node.left, result);
    result.push(node.val);
    traverse(node.right, result);
}
```

### Iterative Approach (Using a Stack)
To mimic recursion, we can use an explicit stack.
1.  Initialize an empty `result` array and an empty `stack`.
2.  Maintain a `curr` pointer starting at `root`.
3.  While `curr` is not null OR the `stack` is not empty:
    - Push all left children of `curr` onto the stack until we reach null.
    - Pop from the stack (this is the next node in inorder).
    - Add its value to `result`.
    - Move `curr` to the right child of the popped node.

### Morris Traversal (O(1) Space)
There is a way to traverse the tree without using a stack or recursion by temporarily modifying the tree (creating threads to successors). This is called Morris Traversal.

### Complexity Analysis
- **Time Complexity**: $O(N)$ because we visit each node exactly once.
- **Space Complexity**: $O(N)$ for the stack or recursion depth in the worst case (a skewed tree). Morris Traversal would be $O(1)$.

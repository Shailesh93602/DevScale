# Editorial — Invert Binary Tree

## Approach 1: Recursive Depth-First Search (DFS) (O(N) Time, O(H) Space)

The recursive approach is extremely elegant for tree problems. 
Think about what "inverting" a tree means:
1. The root stays the same.
2. The left child becomes the right child.
3. The right child becomes the left child.
4. And this rule applies to *every single node* in the entire tree.

This perfectly describes a recursive function!
For any given node, we store its `left` child in a temporary variable. Then, we overwrite its `left` child with the *results of recursively inverting the `right` child*. Finally, we overwrite its `right` child with the *results of recursively inverting the original `left` child*.

The base case is when the node is `null`, in which case we simply return `null`.

```typescript
function invertTree(root: TreeNode | null): TreeNode | null {
  // Base case: if the tree is empty, return null.
  if (root === null) {
      return null;
  }

  // Swap the left and right children recursively
  const right = invertTree(root.right);
  const left = invertTree(root.left);

  // Re-assign them swapped
  root.left = right;
  root.right = left;

  // Return the current root
  return root;
}
```

**Complexity:**
- **Time Complexity:** **O(N)** since each node in the tree is visited exactly once.
- **Space Complexity:** **O(H)** where $H$ is the height of the tree, representing the maximum number of recursive calls on the call stack at any given time. In the worst case (a completely unbalanced tree), to $O(N)$. In the best case (a perfectly balanced tree), $O(\log N)$.

---

## Approach 2: Iterative Breadth-First Search (BFS) (O(N) Time, O(N) Space)

If you're worried about call stack overflow from deep recursion on massive trees, an iterative approach using a queue (or stack) is a great alternative.
The logic remains the same: for every node we visit, we simply swap its left and right children.

We can use a queue to traverse the tree layer by layer (BFS).

```typescript
function invertTree(root: TreeNode | null): TreeNode | null {
  if (root === null) return null;

  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Swap the left and right children of the current node
    const temp = current.left;
    current.left = current.right;
    current.right = temp;

    // Add children to the queue to be processed later
    if (current.left !== null) queue.push(current.left);
    if (current.right !== null) queue.push(current.right);
  }

  return root;
}
```

**Complexity:**
- **Time Complexity:** **O(N)**. Every node is added to and removed from the queue exactly once.
- **Space Complexity:** **O(N)**. In the worst case, the queue will contain all nodes of the lowest level, which for a perfectly balanced tree is $N/2$ nodes.

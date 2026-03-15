# Editorial — Construct BST from Preorder Traversal

## Problem Summary
Build a Binary Search Tree (BST) from its preorder traversal array.

## Approach 1: Recursive with Bounds (Optimal)
In a preorder traversal, the first element is the root. The key property of a BST is that for any node, all left children are smaller and all right children are larger.

We can maintain an upper bound for each recursive call:
1. Use an index to track which element from `preorder` we are processing.
2. If the current element is within the `limit`, create a node and increment the index.
3. For the left child, the new limit is the current node's value.
4. For the right child, the limit remains the same as the current call's limit.

### Complexity:
- **Time Complexity**: $O(N)$, where $N$ is the number of nodes. Each node is visited exactly once.
- **Space Complexity**: $O(H)$, where $H$ is the height of the tree, due to the recursion stack.

## Approach 2: Monotonic Stack (Iterative)
1. The first element is the root. Push it onto the stack.
2. For the next element:
   - If it's smaller than the stack's top, it's the left child of the top. Push it.
   - If it's larger, pop from stack until we find the parent (the last popped node whose value is still less than the current value). It's the right child of that parent. Push it.

### Complexity:
- **Time Complexity**: $O(N)$.
- **Space Complexity**: $O(H)$.

# Editorial — Lowest Common Ancestor of a Binary Tree

### Approach: Recursive DFS
The LCA of two nodes `p` and `q` is the node that has one of them in its left subtree and the other in its right subtree, or the node itself is either `p` or `q` and the other is in its subtree.

1. **Base Cases**:
   - If the root is `null`, return `null`.
   - If the root is `p` or `q`, return the root.
2. **Recursive Step**:
   - Recurse on the left child: `left = LCA(root.left, p, q)`.
   - Recurse on the right child: `right = LCA(root.right, p, q)`.
3. **Combination**:
   - If both `left` and `right` are non-null, it means `p` and `q` were found in different subtrees. Therefore, the current `root` is their Lowest Common Ancestor.
   - If only one of them is non-null, return the non-null one (it might be the LCA itself found deeper in the tree, or just one of `p` or `q`).
   - If both are `null`, return `null`.

**Complexity**
- Time: $O(N)$ where $N$ is the number of nodes in the tree, as we visit each node at most once.
- Space: $O(H)$ where $H$ is the height of the tree (for recursion stack). In the worst case $O(N)$.

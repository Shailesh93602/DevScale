# Lowest Common Ancestor using Binary Lifting

The Lowest Common Ancestor (LCA) of two nodes $u$ and $v$ in a rooted tree is the deepest node that is an ancestor of both $u$ and $v$.

While a simple recursive approach can find the LCA in $O(N)$ time per query, **Binary Lifting** allows us to answer each LCA query in $O(\log N)$ time after an $O(N \log N)$ preprocessing step. This is essential for large trees with many queries.

### Task:
Implement a class `TreeAncestor` that supports:
- `TreeAncestor(int n, int[][] adj, int root)`: Preprocesses the tree with `n` nodes (labeled `0` to `n-1`) given its adjacency list.
- `int getLCA(int u, int v)`: Returns the LCA of nodes `u` and `v`.

### Example 1:
**Input:** `n = 7, adj = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]], root = 0`
**Queries:** `getLCA(3, 4)` returns `1`, `getLCA(3, 5)` returns `0`.

### Constraints:
- `1 <= n <= 5 * 10^4`
- `0 <= u, v < n`
- The input always forms a valid tree.
- Up to `5 * 10^4` calls to `getLCA`.


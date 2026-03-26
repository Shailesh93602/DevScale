# Editorial — Number of Connected Components

### Approach 1: Union-Find (DSU)
This problem is a direct application of the Disjoint Set Union (DSU) data structure.

1. **Initialization**: Start with `count = n`. Each node is its own parent.
2. **Merging**: For each edge `(u, v)`, perform a `union(u, v)`.
3. **Decrement Count**: Every time we successfully merge two components (when `find(u) != find(v)`), we decrement the `count`.
4. **Result**: The final `count` is the number of connected components.

**Complexity**
- Time: $O(E \cdot \alpha(V))$ where $E$ is the number of edges and $\alpha$ is the inverse Ackermann function.
- Space: $O(V)$ to store the parent array.

### Approach 2: DFS/BFS Traversal
We can also use graph traversal to count components.

1. Build an adjacency list representation of the graph.
2. Maintain a `visited` set.
3. Iterate through each node from `0` to `n-1`:
   - If the node has not been visited, increment the component count and start a DFS/BFS from that node to mark all nodes in the same component as visited.

**Complexity**
- Time: $O(V + E)$.
- Space: $O(V + E)$ to store the graph.

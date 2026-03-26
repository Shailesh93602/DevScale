# Editorial — Minimum Spanning Tree

### Approach: Kruskal's Algorithm
Kruskal's algorithm is a greedy algorithm that finds an MST for a connected weighted graph.

**Algorithm**
1. **Sort all edges** by their weight in non-decreasing order.
2. Initialize a **Disjoint Set Union (DSU)** structure to keep track of connected components.
3. Iterate through the sorted edges:
   - For each edge $(u, v)$ with weight $w$:
   - Check if $u$ and $v$ are already in the same component using `find(u)` and `find(v)`.
   - If they are NOT in the same component:
     - Add the weight $w$ to the total total total total total total total total total total total total total total total total total total total total total weight.
     - Combine the components of $u$ and $v$ using `union(u, v)`.
4. Stop when you have added $n-1$ edges (optional optimization).

**Why this works?**
By always picking the smallest available edge that doesn't form a cycle, we stay greedy and ensure the minimum possible total weight while maintaining connectivity.

**Complexity**
- Time: $O(E \log E)$ or $O(E \log V)$ for sorting the edges. The DSU operations are almost $O(1)$.
- Space: $O(V)$ to store the DSU parent array.

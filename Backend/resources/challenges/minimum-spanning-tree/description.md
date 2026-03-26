# Minimum Spanning Tree

Given an undirected connected graph with `n` vertices (numbered `0` to `n-1`) and a list of `edges`, where `edges[i] = [u, v, weight]`, find the total weight of the **Minimum Spanning Tree (MST)**.

A Minimum Spanning Tree is a subset of the edges of a connected, edge-weighted undirected graph that connects all the vertices together, without any cycles and with the minimum possible total edge weight.

### Example 1:
**Input:** `n = 4, edges = [[0,1,1],[1,2,2],[2,3,3],[0,3,4],[0,2,5]]`
**Output:** `6`
**Explanation:** The MST includes edges (0,1), (1,2), and (2,3) with weights 1+2+3 = 6.

### Example 2:
**Input:** `n = 3, edges = [[0,1,5],[1,2,1],[0,2,1]]`
**Output:** `2`
**Explanation:** The MST includes edges (1,2) and (0,2) with weights 1+1 = 2.

### Constraints:
- `1 <= n <= 10^4`
- `n-1 <= edges.length <= 10^5`
- `0 <= edges[i][2] <= 10^6` (weight)
- The graph is guaranteed to be connected.

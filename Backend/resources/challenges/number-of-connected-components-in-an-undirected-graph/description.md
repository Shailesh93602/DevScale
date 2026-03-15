# Number of Connected Components in an Undirected Graph

You have a graph of `n` nodes. You are given an integer `n` and an array `edges` where `edges[i] = [ai, bi]` indicates that there is an edge between `ai` and `bi` in the graph.

Return *the number of connected components in the graph*.

---

## Examples

**Example 1:**
```text
Input: n = 5, edges = [[0,1],[1,2],[3,4]]
Output: 2
Explanation: Nodes 0, 1, and 2 form one component. Nodes 3 and 4 form a second component.
```

**Example 2:**
```text
Input: n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]
Output: 1
Explanation: All nodes are connected in a single component.
```

---

## Constraints

- `1 <= n <= 2000`
- `1 <= edges.length <= 5000`
- `edges[i].length == 2`
- `0 <= ai <= bi < n`
- `ai != bi`
- There are no repeated edges.

# Editorial — Number of Connected Components in an Undirected Graph

## Approach: Union-Find (Disjoint Set) - O(V + E) Time, O(V) Space

This is the classic use case for Union-Find:
1. Initialize `n` nodes, each as their own parent (so initially `n` components).
2. For each edge, perform a `union` operation.
3. If the two nodes were in different sets, the `union` succeeds, and the number of connected components decreases by `1`.
4. If they were already in the same set, do nothing.
5. Return the final count of components.

Alternatively, DFS/BFS also works: build an adjacency list, iterate through all nodes from `0` to `n-1`. For each unvisited node, increment the component count and run a complete DFS/BFS to mark all connected nodes as visited.

```typescript
function countComponents(n: number, edges: number[][]): number {
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(1);
  let components = n;

  function find(node: number): number {
    let p = parent[node];
    while (p !== parent[p]) {
      parent[p] = parent[parent[p]]; // Path compression
      p = parent[p];
    }
    return p;
  }

  function union(n1: number, n2: number): number {
    const p1 = find(n1);
    const p2 = find(n2);
    if (p1 === p2) return 0;
    if (rank[p2] > rank[p1]) { parent[p1] = p2; rank[p2] += rank[p1]; }
    else { parent[p2] = p1; rank[p1] += rank[p2]; }
    return 1;
  }

  for (const [n1, n2] of edges) components -= union(n1, n2);

  return components;
}
```

**Complexity:**
- **Time:** **O(V + E)** — iterating nodes and edges. Union-Find with path compression is nearly O(1).
- **Space:** **O(V)** — parent array and rank array size `n`.

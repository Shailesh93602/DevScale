# Editorial — Redundant Connection

## Approach: Union-Find (O(N) Time, O(N) Space)

A tree is an undirected graph with no cycles. Adding an extra edge to a tree creates exactly one cycle. We need to find the edge that creates this cycle.

Union-Find is perfect for cycle detection in an undirected graph. Initially, every node is in its own set. For each edge `(u, v)`:
1. `find(u)` and `find(v)` to get the leaders/parents.
2. If `u` and `v` share the same parent, they are already connected! Adding this edge `(u, v)` creates a cycle. Since we process edges in order, this edge is the redundant one.
3. Otherwise, `union(u, v)` to merge their sets.

```typescript
function findRedundantConnection(edges: number[][]): number[] {
  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);
  const rank = new Array(edges.length + 1).fill(1);

  function find(node: number) {
    let p = parent[node];
    while (p !== parent[p]) { parent[p] = parent[parent[p]]; p = parent[p]; }
    return p;
  }

  for (const [u, v] of edges) {
    const p1 = find(u), p2 = find(v);
    if (p1 === p2) return [u, v];

    if (rank[p2] > rank[p1]) { parent[p1] = p2; rank[p2] += rank[p1]; }
    else { parent[p2] = p1; rank[p1] += rank[p2]; }
  }
  return [];
}
```

**Complexity:**
- **Time:** **O(N)** — finding and union operations with path compression take nearly `O(1)` time.
- **Space:** **O(N)** — for `parent` and `rank` arrays.

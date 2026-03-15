# Editorial — Graph Valid Tree

## Approach: DFS for Connectivity + Edge Count Check (O(V + E) Time, O(V + E) Space)

A valid graph tree must be:
1. **Fully Connected:** There are no disjoint components.
2. **Acyclic:** No cycles.

And by definition of a tree, an N-node graph **must** have exactly exactly `N - 1` edges.

So the simplest way to solve this is:
1. Check if `edges.length === n - 1`. If not, return false immediately.
2. Use DFS/BFS to traverse the graph starting from node 0.
3. Check if all nodes were visited (`visited.size === n`). If yes, it's a valid tree.

By making sure there are exactly `n - 1` edges and all `n` nodes are visited from node 0, we implicitly guarantee there are no cycles and it's a valid tree.

```typescript
function validTree(n: number, edges: number[][]): boolean {
  if (edges.length !== n - 1) return false;

  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }

  const visited = new Set<number>();

  function dfs(node: number): void {
    if (visited.has(node)) return;
    visited.add(node);
    for (const neighbor of adj[node]) dfs(neighbor);
  }

  dfs(0);
  return visited.size === n;
}
```

**Complexity:**
- **Time:** **O(V + E)** — visiting each node and checking its adjacent edges. Since we already verified E = V - 1, time is essentially O(V).
- **Space:** **O(V + E)** — adjacency list and recursive call stack / visited set.

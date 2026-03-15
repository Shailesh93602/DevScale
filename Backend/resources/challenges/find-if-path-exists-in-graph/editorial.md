# Editorial — Find if Path Exists in Graph

## Approach: BFS/DFS Traversal (O(V+E) Time, O(V+E) Space)

Standard reachability problem. We can use a BFS or DFS traversal from `start` to check if `end` is reachable.
1. Build an adjacency list to represent the undirected graph.
2. Maintain a `visited` set to prevent cycles and redundant work.
3. Push `start` node to a queue and start checking its neighbors.
4. If a neighbor is `end`, return `true` immediately.
5. Otherwise, mark it as visited and push to the queue.
6. If the queue becomes empty and `end` hasn't been found, return `false`.

Alternatively, Union-Find also easily solves this: unify all edges, then check if `find(start) === find(end)`.

```typescript
function validPath(n: number, edges: number[][], start: number, end: number): boolean {
  if (start === end) return true;
  
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  
  const visited = new Set<number>([start]);
  const queue = [start];
  
  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr === end) return true;
    for (const neighbor of adj[curr]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return false;
}
```

**Complexity:**
- **Time/Space:** **O(V+E)** — where V is the number of vertices and E is the number of edges. The entire graph might need to be traversed in the worst case.

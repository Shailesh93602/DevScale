# Editorial — Course Schedule

## Approach: DFS with 3-State Cycle Detection (O(V+E) Time, O(V+E) Space)

The problem reduces to: **does the directed graph have a cycle?**

We use 3-coloring: `0` = unvisited, `1` = currently being visited (in current DFS path), `2` = fully processed.

If during DFS we reach a node with state `1`, we've found a back edge — a cycle exists!

```typescript
function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  for (const [a, b] of prerequisites) adj[b].push(a);

  const state = new Array(numCourses).fill(0);

  function hasCycle(node: number): boolean {
    if (state[node] === 1) return true;
    if (state[node] === 2) return false;
    state[node] = 1;
    for (const nb of adj[node]) if (hasCycle(nb)) return true;
    state[node] = 2;
    return false;
  }

  for (let i = 0; i < numCourses; i++) if (hasCycle(i)) return false;
  return true;
}
```

**Complexity:**
- **Time:** **O(V + E)** — each node and edge processed once.
- **Space:** **O(V + E)** — adjacency list + state array + call stack.

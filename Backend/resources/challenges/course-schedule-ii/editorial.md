# Editorial — Course Schedule II

## Approach: Kahn's Algorithm — BFS Topological Sort (O(V+E) Time, O(V+E) Space)

We want to output the topological ordering. Kahn's Algorithm naturally produces this:

1. Build an **adjacency list** and an **in-degree array** (number of prerequisites per course).
2. Initialize the queue with all courses that have **in-degree 0** (no prerequisites).
3. Dequeue a course, add to result, decrease in-degree of its successors. If a successor's in-degree drops to 0, enqueue it.
4. If `result.length === numCourses`, no cycle — return result. Otherwise, there's a cycle → return `[]`.

```typescript
function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  const adj = Array.from({ length: numCourses }, () => [] as number[]);
  const inDegree = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) { adj[b].push(a); inDegree[a]++; }

  const queue = [];
  for (let i = 0; i < numCourses; i++) if (inDegree[i] === 0) queue.push(i);

  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const nb of adj[node]) if (--inDegree[nb] === 0) queue.push(nb);
  }

  return order.length === numCourses ? order : [];
}
```

**Complexity:**
- **Time:** **O(V + E)** — each node/edge processed once.
- **Space:** **O(V + E)** — adjacency list + in-degree + queue.

# Editorial — Clone Graph

## Approach: DFS with HashMap (O(N) Time, O(N) Space)

The challenge is handling cycles. We use a HashMap that maps original nodes to their clones. When we revisit an already-cloned node, we return the existing clone instead of creating a new one.

```typescript
function cloneGraph(node: _Node | null): _Node | null {
  if (!node) return null;
  const map = new Map<_Node, _Node>();

  function dfs(curr: _Node): _Node {
    if (map.has(curr)) return map.get(curr)!;
    const clone = new _Node(curr.val);
    map.set(curr, clone);
    for (const nb of curr.neighbors) clone.neighbors.push(dfs(nb));
    return clone;
  }

  return dfs(node);
}
```

**Complexity:**
- **Time:** **O(N + E)** — N nodes, E edges.
- **Space:** **O(N)** — HashMap + call stack.

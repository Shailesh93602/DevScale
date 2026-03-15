// O(N) Time, O(N) Space — DFS with HashMap to handle cycles
function cloneGraph(node: _Node | null): _Node | null {
  if (node === null) return null;

  const cloneMap = new Map<_Node, _Node>();

  function dfs(curr: _Node): _Node {
    if (cloneMap.has(curr)) return cloneMap.get(curr)!;

    const clone = new _Node(curr.val);
    cloneMap.set(curr, clone);

    for (const neighbor of curr.neighbors) {
      clone.neighbors.push(dfs(neighbor));
    }

    return clone;
  }

  return dfs(node);
}

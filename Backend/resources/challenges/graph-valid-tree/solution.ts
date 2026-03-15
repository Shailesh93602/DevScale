// O(V + E) Time, O(V + E) Space — DFS for connectivity + edge count check
function validTree(n: number, edges: number[][]): boolean {
  // Tree property 1: A valid tree with n nodes must have exactly n-1 edges.
  if (edges.length !== n - 1) return false;

  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const visited = new Set<number>();

  function dfs(node: number): void {
    if (visited.has(node)) return;
    visited.add(node);
    for (const neighbor of adj[node]) {
      dfs(neighbor);
    }
  }

  dfs(0);

  // Tree property 2: A valid tree must be fully connected.
  return visited.size === n;
}

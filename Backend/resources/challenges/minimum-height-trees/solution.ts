// O(V) Time, O(V) Space — Topological Sort (Trimming leaves)
function findMinHeightTrees(n: number, edges: number[][]): number[] {
  if (n === 1) return [0];

  const adj: number[][] = Array.from({ length: n }, () => []);
  const degree = new Array(n).fill(0);

  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
    degree[u]++;
    degree[v]++;
  }

  let leaves: number[] = [];
  for (let i = 0; i < n; i++) {
    if (degree[i] === 1) leaves.push(i);
  }

  let remainingNodes = n;
  while (remainingNodes > 2) {
    remainingNodes -= leaves.length;
    const newLeaves: number[] = [];

    for (const leaf of leaves) {
      for (const neighbor of adj[leaf]) {
        degree[neighbor]--;
        if (degree[neighbor] === 1) {
          newLeaves.push(neighbor);
        }
      }
    }
    leaves = newLeaves;
  }

  return leaves;
}

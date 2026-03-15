// O(N) Time, O(N) Space — Union Find
function findRedundantConnection(edges: number[][]): number[] {
  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);
  const rank = new Array(edges.length + 1).fill(1);

  function find(node: number): number {
    let p = parent[node];
    while (p !== parent[p]) {
      parent[p] = parent[parent[p]]; // path compression
      p = parent[p];
    }
    return p;
  }

  function union(n1: number, n2: number): boolean {
    const p1 = find(n1);
    const p2 = find(n2);

    if (p1 === p2) return false; // Cycle detected

    if (rank[p2] > rank[p1]) {
      parent[p1] = p2;
      rank[p2] += rank[p1];
    } else {
      parent[p2] = p1;
      rank[p1] += rank[p2];
    }
    return true;
  }

  for (const [u, v] of edges) {
    if (!union(u, v)) {
      return [u, v];
    }
  }

  return [];
}

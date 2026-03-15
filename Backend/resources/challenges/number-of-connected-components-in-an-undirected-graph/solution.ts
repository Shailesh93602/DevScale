// O(V + E) Time, O(V) Space — Union-Find / Disjoint Set
function countComponents(n: number, edges: number[][]): number {
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(1);
  let components = n;

  function find(node: number): number {
    let p = parent[node];
    while (p !== parent[p]) {
      parent[p] = parent[parent[p]]; // Path compression
      p = parent[p];
    }
    return p;
  }

  function union(n1: number, n2: number): number {
    const p1 = find(n1);
    const p2 = find(n2);

    if (p1 === p2) return 0; // Already in same component

    if (rank[p2] > rank[p1]) {
      parent[p1] = p2;
      rank[p2] += rank[p1];
    } else {
      parent[p2] = p1;
      rank[p1] += rank[p2];
    }
    return 1;
  }

  for (const [n1, n2] of edges) {
    components -= union(n1, n2);
  }

  return components;
}

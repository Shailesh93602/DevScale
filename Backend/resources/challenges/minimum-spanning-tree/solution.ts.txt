function findMST(n: number, edges: number[][]): number {
  // Sort edges by weight
  edges.sort((a, b) => a[2] - b[2]);

  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (i: number): number => {
    if (parent[i] === i) return i;
    parent[i] = find(parent[i]);
    return parent[i];
  };

  const union = (i: number, j: number): boolean => {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
      return true;
    }
    return false;
  };

  let totalWeight = 0;
  let edgesCount = 0;

  for (const [u, v, weight] of edges) {
    if (union(u, v)) {
      totalWeight += weight;
      edgesCount++;
      if (edgesCount === n - 1) break;
    }
  }

  return totalWeight;
}

function countComponents(n: number, edges: number[][]): number {
  const parent = Array.from({ length: n }, (_, i) => i);
  let count = n;

  const find = (i: number): number => {
    if (parent[i] === i) return i;
    parent[i] = find(parent[i]);
    return parent[i];
  };

  const union = (i: number, j: number): void => {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
      count--;
    }
  };

  for (const [u, v] of edges) {
    union(u, v);
  }

  return count;
}

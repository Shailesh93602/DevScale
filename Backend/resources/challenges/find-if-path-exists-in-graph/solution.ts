// O(V + E) Time, O(V + E) Space — BFS
function validPath(n: number, edges: number[][], start: number, end: number): boolean {
  if (start === end) return true;

  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const visited = new Set<number>();
  const queue: number[] = [start];
  visited.add(start);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr === end) return true;

    for (const neighbor of adj[curr]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return false;
}

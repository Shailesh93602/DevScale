function findCheapestPrice(n: number, flights: number[][], src: number, dst: number, k: number): number {
  const adj: Map<number, [number, number][]> = new Map();
  for (const [u, v, w] of flights) {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u)!.push([v, w]);
  }

  // dists[i] stores minimum cost to reach city i
  let dists = new Array(n).fill(Infinity);
  dists[src] = 0;

  // Queue stores [city, current_cost]
  let queue: [number, number][] = [[src, 0]];
  let stops = 0;

  while (queue.length > 0 && stops <= k) {
    const size = queue.length;
    const nextDists = [...dists];

    for (let i = 0; i < size; i++) {
      const [u, cost] = queue.shift()!;
      const neighbors = adj.get(u);
      
      if (neighbors) {
        for (const [v, w] of neighbors) {
          if (cost + w < nextDists[v]) {
            nextDists[v] = cost + w;
            queue.push([v, nextDists[v]]);
          }
        }
      }
    }
    dists = nextDists;
    stops++;
  }

  return dists[dst] === Infinity ? -1 : dists[dst];
}


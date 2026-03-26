function findItinerary(tickets: string[][]): string[] {
  const adj: Map<string, string[]> = new Map();

  // Build adjacency list
  for (const [from, to] of tickets) {
    if (!adj.has(from)) adj.set(from, []);
    adj.get(from)!.push(to);
  }

  // Sort neighbors lexicographically (descending so we can pop from the back in O(1))
  for (const neighbors of adj.values()) {
    neighbors.sort((a, b) => (a < b ? 1 : -1));
  }

  const result: string[] = [];

  function visit(airport: string) {
    const neighbors = adj.get(airport);
    while (neighbors && neighbors.length > 0) {
      const next = neighbors.pop()!;
      visit(next);
    }
    result.push(airport);
  }

  visit("JFK");
  return result.reverse();
}

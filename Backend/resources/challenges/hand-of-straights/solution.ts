// Optimal solution: O(n log n) time, O(n) space — Sorting + Greedy
function isNStraightHand(hand: number[], groupSize: number): boolean {
  if (hand.length % groupSize !== 0) return false;

  const count = new Map<number, number>();
  for (const card of hand) {
    count.set(card, (count.get(card) || 0) + 1);
  }

  const sorted = [...count.keys()].sort((a, b) => a - b);

  for (const start of sorted) {
    const freq = count.get(start) || 0;
    if (freq === 0) continue;

    for (let i = 0; i < groupSize; i++) {
      const card = start + i;
      const cardCount = count.get(card) || 0;
      if (cardCount < freq) return false;
      count.set(card, cardCount - freq);
    }
  }

  return true;
}

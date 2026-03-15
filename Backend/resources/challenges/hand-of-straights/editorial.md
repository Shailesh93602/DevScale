# Editorial — Hand of Straights

## Problem Summary

Determine if an array of cards can be divided into groups of `groupSize` consecutive numbers.

---

## Approach 1 — Sorting + Greedy with HashMap (O(n log n) time, O(n) space) ✅ Optimal

1. If `hand.length % groupSize !== 0`, return false immediately.
2. Count the frequency of each card using a map.
3. Sort the unique cards.
4. For each card (in sorted order), if it still has remaining count, try to form a group starting from that card. Decrement counts for `groupSize` consecutive values.

```typescript
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
```

**Complexity:**
- Time: **O(n log n)** — dominated by sorting.
- Space: **O(n)** — hash map.

---

## Approach 2 — Min-Heap (O(n log n) time, O(n) space)

Use a min-heap to always pick the smallest available card and try to form groups greedily. This achieves similar complexity but is useful when we need to process cards dynamically.

```typescript
function isNStraightHand(hand: number[], groupSize: number): boolean {
  if (hand.length % groupSize !== 0) return false;

  const count = new Map<number, number>();
  for (const card of hand) {
    count.set(card, (count.get(card) || 0) + 1);
  }

  const sorted = [...count.keys()].sort((a, b) => a - b);

  for (const start of sorted) {
    while ((count.get(start) || 0) > 0) {
      for (let i = 0; i < groupSize; i++) {
        const card = start + i;
        if ((count.get(card) || 0) <= 0) return false;
        count.set(card, count.get(card)! - 1);
      }
    }
  }

  return true;
}
```

**Complexity:**
- Time: **O(n log n)** — sorting dominates.
- Space: **O(n)** — hash map.

---

## Key Insight

The greedy strategy works because we must always include the smallest remaining card in some group. Since groups must be consecutive, we know exactly which cards must accompany it. By processing cards from smallest to largest, we ensure no card is left stranded.

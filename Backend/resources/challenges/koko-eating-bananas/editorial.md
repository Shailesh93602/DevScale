# Editorial — Koko Eating Bananas

## Problem Summary

Find the minimum eating speed `k` such that all banana piles can be eaten within `h` hours.

---

## Approach 1 — Binary Search on Answer (O(n log m) time, O(1) space) ✅ Optimal

Binary search on the speed `k` in range `[1, max(piles)]`. For each candidate speed, check if all piles can be eaten in `h` hours.

```typescript
function minEatingSpeed(piles: number[], h: number): number {
  let left = 1;
  let right = Math.max(...piles);

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    const hours = piles.reduce((sum, p) => sum + Math.ceil(p / mid), 0);

    if (hours <= h) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }

  return left;
}
```

**Complexity:**
- Time: **O(n log m)** where `n` is number of piles and `m` is max pile size.
- Space: **O(1)**.

---

## Key Insight

This is a classic "binary search on the answer" problem. The answer space [1, max(piles)] is monotonic: if speed `k` works, then `k+1` also works. We binary search for the smallest `k` where the total hours <= `h`. The feasibility check takes O(n) per candidate.

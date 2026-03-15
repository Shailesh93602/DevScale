# Editorial — Top K Frequent Elements

## Problem Summary

Find the K most frequently occurring numbers in an array. Time complexity must be better than O(n log n).

---

## Approach 1 — HashMap + Sort (O(n log n))

Count frequencies, sort by frequency, take top k.

```typescript
function topKFrequent(nums: number[], k: number): number[] {
  const freq = new Map<number, number>();
  for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(e => e[0]);
}
```

**Complexity:** Time **O(n log n)**, Space **O(n)**

---

## Approach 2 — Bucket Sort (Optimal O(n))

Since frequencies range from 1 to `n`, we can use bucket sort. Create an array of `n + 1` buckets. Bucket at index `i` holds all elements that appear exactly `i` times. Then sweep from the end to collect the top K.

```typescript
function topKFrequent(nums: number[], k: number): number[] {
  const freq = new Map<number, number>();
  for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1);

  // Buckets indexed by frequency (0..n)
  const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);
  for (const [num, count] of freq) {
    buckets[count].push(num);
  }

  const result: number[] = [];
  // Sweep from highest frequency to lowest
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
    for (const num of buckets[i]) {
      result.push(num);
      if (result.length === k) break;
    }
  }

  return result;
}
```

**Complexity:**
- Time: **O(n)** — Counting pass + bucketing pass + result collection, all linear.
- Space: **O(n)** — HashMap + buckets array.

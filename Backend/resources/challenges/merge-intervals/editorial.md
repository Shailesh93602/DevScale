# Editorial — Merge Intervals

## Problem Summary

Merge all overlapping intervals and return the resulting non-overlapping intervals.

---

## Approach 1 — Sorting (O(n log n) time, O(n) space) ✅ Optimal

1. Sort intervals by start time.
2. Iterate through sorted intervals. If the current interval overlaps with the last merged interval (i.e., `current.start <= lastMerged.end`), merge them by extending the end. Otherwise, add the current interval as a new merged interval.

```typescript
function merge(intervals: number[][]): number[][] {
  intervals.sort((a, b) => a[0] - b[0]);
  const merged: number[][] = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const curr = intervals[i];

    if (curr[0] <= last[1]) {
      last[1] = Math.max(last[1], curr[1]);
    } else {
      merged.push(curr);
    }
  }

  return merged;
}
```

**Complexity:**
- Time: **O(n log n)** — sorting dominates.
- Space: **O(n)** — output array (O(log n) for sorting).

---

## Approach 2 — Connected Components (O(n^2) time, O(n) space)

Build a graph where overlapping intervals are connected. Find connected components and merge each component. This is less efficient but demonstrates the graph perspective.

**Complexity:**
- Time: **O(n^2)** — checking every pair.
- Space: **O(n^2)** — adjacency list.

Not practical for large inputs — the sorting approach is strictly better.

---

## Key Insight

After sorting by start time, overlapping intervals are always adjacent. This reduces the problem to a single linear scan where we extend the current interval or start a new one.

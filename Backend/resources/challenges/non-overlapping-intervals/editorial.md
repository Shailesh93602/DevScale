# Editorial — Non-overlapping Intervals

## Problem Summary

Find the minimum number of intervals to remove so that the remaining intervals do not overlap.

---

## Approach 1 — Greedy Sort by End (O(n log n) time, O(1) space) ✅ Optimal

This is the classic **interval scheduling maximization** problem. Sort by end time, then greedily keep intervals that don't overlap with the last kept interval.

The number of removals = total intervals - max non-overlapping intervals.

```typescript
function eraseOverlapIntervals(intervals: number[][]): number {
  intervals.sort((a, b) => a[1] - b[1]);
  let count = 1; // keep count of non-overlapping
  let prevEnd = intervals[0][1];

  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] >= prevEnd) {
      count++;
      prevEnd = intervals[i][1];
    }
  }

  return intervals.length - count;
}
```

**Complexity:**
- Time: **O(n log n)** — sorting.
- Space: **O(1)** — in-place (ignoring sort space).

---

## Approach 2 — Sort by Start + Remove Longer (O(n log n) time, O(1) space)

Sort by start time. When two intervals overlap, always remove the one with the larger end time (it's more likely to cause future overlaps).

```typescript
function eraseOverlapIntervals(intervals: number[][]): number {
  intervals.sort((a, b) => a[0] - b[0]);
  let removals = 0;
  let prevEnd = intervals[0][1];

  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] < prevEnd) {
      removals++;
      prevEnd = Math.min(prevEnd, intervals[i][1]);
    } else {
      prevEnd = intervals[i][1];
    }
  }

  return removals;
}
```

**Complexity:**
- Time: **O(n log n)** — sorting.
- Space: **O(1)**.

---

## Key Insight

This is equivalent to finding the maximum set of non-overlapping intervals (interval scheduling). By sorting by end time and greedily picking the earliest-ending non-overlapping interval, we maximize the count of kept intervals and minimize removals.

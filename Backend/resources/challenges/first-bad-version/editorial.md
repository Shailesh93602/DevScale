# Editorial — First Bad Version

## Problem Summary

Find the first bad version in a sequence [1..n] using binary search, minimizing API calls.

---

## Approach 1 — Binary Search (O(log n) time, O(1) space) ✅ Optimal

Apply binary search. If `mid` is bad, the first bad version is at `mid` or earlier. If not bad, it's after `mid`.

```typescript
function firstBadVersion(n: number): number {
  let left = 1;
  let right = n;

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (isBadVersion(mid)) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }

  return left;
}
```

**Complexity:**
- Time: **O(log n)** — halving the range each iteration.
- Space: **O(1)**.

---

## Key Insight

This is a classic "find the leftmost true" binary search pattern. The search space is [1, n], and we narrow it by checking the midpoint. When `isBadVersion(mid)` is true, the answer could be `mid` itself, so we set `right = mid` (not `mid - 1`). The loop terminates when `left === right`.

# Editorial — Find Peak Element

## Problem Summary

Find any peak element (strictly greater than neighbors) in O(log n) time.

---

## Approach 1 — Linear Scan (O(n) time, O(1) space)

Just find the maximum element — it's always a peak.

```typescript
function findPeakElement(nums: number[]): number {
  let maxIdx = 0;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > nums[maxIdx]) maxIdx = i;
  }
  return maxIdx;
}
```

**Complexity:** O(n) time, O(1) space. Does not meet the O(log n) requirement.

---

## Approach 2 — Binary Search (O(log n) time, O(1) space) ✅ Optimal

If `nums[mid] < nums[mid + 1]`, then the right side must contain a peak (since the array goes up and eventually drops to -infinity). Otherwise, the left side (including mid) must contain a peak.

```typescript
function findPeakElement(nums: number[]): number {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] < nums[mid + 1]) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}
```

**Complexity:**
- Time: **O(log n)**.
- Space: **O(1)**.

---

## Key Insight

The key insight is that you can always move toward the higher neighbor. Since the boundaries are -infinity, moving uphill is guaranteed to find a peak. This makes binary search applicable even though the array isn't sorted — we just need a direction guarantee.

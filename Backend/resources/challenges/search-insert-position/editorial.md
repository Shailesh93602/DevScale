# Editorial — Search Insert Position

## Problem Summary

Find the index of a target in a sorted array, or the index where it should be inserted.

---

## Approach 1 — Binary Search (O(log n) time, O(1) space) ✅ Optimal

Standard binary search. When the loop ends without finding the target, `left` points to the correct insertion position.

```typescript
function searchInsert(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return left;
}
```

**Complexity:**
- Time: **O(log n)**.
- Space: **O(1)**.

---

## Key Insight

When binary search doesn't find the target, `left` naturally ends up at the position where the target should be inserted. This is because `left` always advances past elements smaller than target, so it stops at the first element >= target (or past the end if target is larger than all).

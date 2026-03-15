# Editorial — Binary Search

## Problem Summary

Search for a target in a sorted array and return its index, or -1 if not found. Must be O(log n).

---

## Approach 1 — Iterative Binary Search (O(log n) time, O(1) space) ✅ Optimal

Maintain two pointers `left` and `right`. Compute `mid`, compare `nums[mid]` with `target`, and narrow the search range accordingly.

```typescript
function search(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}
```

**Complexity:**
- Time: **O(log n)** — halving the search space each step.
- Space: **O(1)** — constant extra space.

---

## Approach 2 — Recursive Binary Search (O(log n) time, O(log n) space)

Same logic but using recursion.

```typescript
function search(nums: number[], target: number): number {
  function binarySearch(left: number, right: number): number {
    if (left > right) return -1;
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) return binarySearch(mid + 1, right);
    return binarySearch(left, mid - 1);
  }
  return binarySearch(0, nums.length - 1);
}
```

**Complexity:**
- Time: **O(log n)**.
- Space: **O(log n)** — recursion stack.

---

## Key Insight

Binary search works on sorted data by eliminating half the remaining elements each step. The key detail is computing `mid` as `left + (right - left) / 2` to avoid integer overflow (relevant in other languages, good practice in all).

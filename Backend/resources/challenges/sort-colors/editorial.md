# Editorial — Sort Colors

## Problem Summary

Given an array containing only 0, 1, and 2, sort it in-place in a single pass without using the built-in sort function. This is known as the **Dutch National Flag Problem**.

---

## Approach 1 — Two-Pass Counting Sort (O(n) Time, O(1) Space)

Count the occurrences of 0, 1, and 2, then overwrite the array.

```typescript
function sortColors(nums: number[]): void {
  let count = [0, 0, 0];
  for (const n of nums) count[n]++;
  let i = 0;
  for (let color = 0; color < 3; color++) {
    while (count[color]-- > 0) nums[i++] = color;
  }
}
```

**Complexity:** Time **O(n)**, Space **O(1)** — Two passes needed.

---

## Approach 2 — Dutch National Flag (One-Pass, Optimal)

Maintain three pointers:
- `low`: boundary for 0s — everything before `low` is 0.
- `mid`: current element being processed.
- `high`: boundary for 2s — everything after `high` is 2.

```typescript
function sortColors(nums: number[]): void {
  let low = 0, mid = 0, high = nums.length - 1;

  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++; mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--; // Don't increment mid — we need to re-examine the swapped value
    }
  }
}
```

**Why not increment `mid` when swapping with `high`?** Because the element at `nums[high]` might be 0, 1, or 2 — we haven't examined it yet. We must check it before moving forward.

**Complexity:**
- Time: **O(n)** — Single pass.
- Space: **O(1)** — Only pointer variables.

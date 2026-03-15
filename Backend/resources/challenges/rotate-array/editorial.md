# Editorial — Rotate Array

## Problem Summary

Given an integer array, rotate it to the right by `k` steps in-place.

---

## Approach 1 — Extra Array (O(n) Time, O(n) Space)

Create a copy of the array. Place each element at its new rotated position: `result[(i + k) % n] = nums[i]`.

```typescript
function rotate(nums: number[], k: number): void {
  const n = nums.length;
  k = k % n;
  const result = new Array(n);
  for (let i = 0; i < n; i++) {
    result[(i + k) % n] = nums[i];
  }
  for (let i = 0; i < n; i++) nums[i] = result[i];
}
```

**Complexity:** Time **O(n)**, Space **O(n)**

---

## Approach 2 — Triple Reverse (Optimal O(n) Time, O(1) Space)

This elegant trick exploits array reversal:

1. Normalize `k = k % n` (handles `k >= n`).
2. Reverse the **entire** array.
3. Reverse the **first k** elements.
4. Reverse the **remaining n-k** elements.

**Why it works:**

For `[1,2,3,4,5,6,7]` with `k=3`:
- Reverse all → `[7,6,5,4,3,2,1]`
- Reverse first 3 → `[5,6,7,4,3,2,1]`
- Reverse last 4 → `[5,6,7,1,2,3,4]` ✓

```typescript
function rotate(nums: number[], k: number): void {
  const n = nums.length;
  k = k % n;
  
  const reverse = (start: number, end: number) => {
    while (start < end) {
      [nums[start], nums[end]] = [nums[end], nums[start]];
      start++; end--;
    }
  };

  reverse(0, n - 1);     // Step 1: reverse all
  reverse(0, k - 1);     // Step 2: reverse first k
  reverse(k, n - 1);     // Step 3: reverse rest
}
```

**Complexity:**
- Time: **O(n)** — Each element is reversed at most twice.
- Space: **O(1)** — In-place with no extra storage.

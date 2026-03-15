# Editorial — Product of Array Except Self

## Problem Summary

Given an array of integer values, return an array where each index contains the product of all other elements in the input array. You **cannot** use division, and your algorithm must run in O(n) time.

---

## Approach 1 — Left and Right Prefix Arrays (O(n) time, O(n) space)

If we can't use division, we have to multiply all elements before `i` and all elements after `i` together. We can do this efficiently by pre-computing two arrays:
1. `L[i]` = product of all elements to the left of `i`
2. `R[i]` = product of all elements to the right of `i`

Then, the final answer at index `i` is simply `L[i] * R[i]`.

```typescript
function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const L = new Array(n);
  const R = new Array(n);
  const ans = new Array(n);

  // L[i] contains the product of all the elements to the left
  L[0] = 1;
  for (let i = 1; i < n; i++) {
    L[i] = nums[i - 1] * L[i - 1];
  }

  // R[i] contains the product of all the elements to the right
  R[n - 1] = 1;
  for (let i = n - 2; i >= 0; i--) {
    R[i] = nums[i + 1] * R[i + 1];
  }

  // Multiply L[i] and R[i]
  for (let i = 0; i < n; i++) {
    ans[i] = L[i] * R[i];
  }

  return ans;
}
```

**Complexity:**
- Time: **O(n)** — 3 passes over the array.
- Space: **O(n)** — For the `L` and `R` arrays.

---

## Approach 2 — O(1) Extra Space (Optimal approach)

The problem statement asks: *Can you solve the problem in O(1) extra space complexity? (The output array does not count as extra space).*

We can optimize Approach 1 by using our final `ans` array to store the left products first. Then, instead of building a full right product array `R`, we can just keep a single rolling variable `R_prod` as we iterate backwards, multiplying it directly into the `ans` array.

```typescript
function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  const ans = new Array(n);

  // Pass 1: Build left products in the ans array
  ans[0] = 1;
  for (let i = 1; i < n; i++) {
    ans[i] = nums[i - 1] * ans[i - 1];
  }

  // Pass 2: Multiply by right products on the fly
  let R = 1;
  for (let i = n - 1; i >= 0; i--) {
    ans[i] = ans[i] * R; // left product * right product
    R = R * nums[i];     // update rolling right product
  }

  return ans;
}
```

**Complexity:**
- Time: **O(n)** — 2 passes over the array.
- Space: **O(1)** — Only a single variable `R` is used (aside from the required output array).

---

## Alternative Insight — What if division *was* allowed?

If division were allowed, you would multiply all elements together to get a `total_product` and then for each element do `ans[i] = total_product / nums[i]`.
However, you would have to handle **zeros**:
- **0 Zeros:** `total_product / nums[i]` works everywhere.
- **1 Zero:** The answer is `0` everywhere *except* at the index of the zero, which equals the product of all other non-zero elements.
- **2+ Zeros:** The answer is `0` everywhere. 

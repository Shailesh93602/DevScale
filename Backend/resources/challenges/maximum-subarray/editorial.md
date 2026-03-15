# Editorial — Maximum Subarray

## Problem Summary

Given an integer array, find the contiguous subarray that has the highest sum and return that sum. It is possible the subarray consists of only a single element.

---

## Approach 1 — Brute Force (Time Limit Exceeded)

Check every possible contiguous subarray. Iterate over all starting indices, then iterate over all ending indices, and find the sum.

```typescript
function maxSubArray(nums: number[]): number {
  let max_sum = -Infinity;
  for (let i = 0; i < nums.length; i++) {
    let current_sum = 0;
    for (let j = i; j < nums.length; j++) {
      current_sum += nums[j];
      max_sum = Math.max(max_sum, current_sum);
    }
  }
  return max_sum;
}
```

**Complexity:**
- Time: **O(n²)** — Nested loops to find the sum of all subarrays. This is too slow for `n = 10^5`.
- Space: **O(1)**

---

## Approach 2 — Kadane's Algorithm (Optimal O(n) Time, O(1) Space)

Kadane's algorithm is a dynamic programming approach that scans the array once. At each point `i`, it calculates the maximum subarray sum **ending at index `i`**.

The core idea is simple:
Does the current element `nums[i]` want to extend the previous maximum subarray ending at `i-1`, or would it be better off starting a new subarray independently?
`current_subarray_sum = Math.max(nums[i], current_subarray_sum + nums[i])`

If the old `current_subarray_sum` is negative, adding `nums[i]` will be smaller than `nums[i]` itself natively, so we discard the past and reboot the sum at `nums[i]`.

```typescript
function maxSubArray(nums: number[]): number {
  let max_so_far = nums[0];
  let current_max = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    current_max = Math.max(nums[i], current_max + nums[i]);
    max_so_far = Math.max(max_so_far, current_max);
  }
  
  return max_so_far;
}
```

**Complexity:**
- Time: **O(n)** — We iterate through the array of numbers exactly once.
- Space: **O(1)** — Only tracking integer variables.

---

## Approach 3 — Divide and Conquer (O(n log n) Time)

Though not optimal for time, a D&C approach helps understand recursion.
Divide the array through its middle. The maximum subarray must be:
1. Entirely in the left half, OR
2. Entirely in the right half, OR
3. Crossing the midpoint.

We recursively find the maximums of the halves, then calculate the crossing maximum by walking outwards from the center. Finally, we take the maximum among all three possibilities.

**Complexity:**
- Time: **O(n log n)**
- Space: **O(log n)** from maximum stack calls scaling logarithmically with array size.

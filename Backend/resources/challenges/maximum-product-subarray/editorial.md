# Editorial — Maximum Product Subarray

## Problem Summary

Find the contiguous subarray within an integer array that has the largest product and return that product.

---

## Approach 1 — Brute Force (Time Limit Exceeded)

Check every possible contiguous subarray by using nested loops.

```typescript
function maxProduct(nums: number[]): number {
  let max_product = -Infinity;
  for (let i = 0; i < nums.length; i++) {
    let current_product = 1;
    for (let j = i; j < nums.length; j++) {
      current_product *= nums[j];
      max_product = Math.max(max_product, current_product);
    }
  }
  return max_product;
}
```

**Complexity:**
- Time: **O(n²)** — Nested loops to find the product of all subarrays. This is too slow for large inputs.
- Space: **O(1)**

---

## Approach 2 — Modified Kadane's Algorithm (Optimal O(n) Time, O(1) Space)

The key difference between Maximum Subarray Sum and Maximum Subarray Product is how **negative numbers** affect the result. 

If we have a highly negative running product, and we hit another negative number, suddenly it becomes a massive positive product! Because of this, tracking just the "maximum so far" isn't enough. We must also track the **minimum (most negative) so far**.

When we encounter a negative number, the maximum and minimum products flip:
- A negative number multiplied by a large negative minimum product becomes a large positive maximum.
- A negative number multiplied by a large positive maximum product becomes a large negative minimum.

If we hit a `0`, both the max and min products reset to `0`, and we essentially start fresh from the next element (as any sequence going through `0` would just yield a product of `0`).

```typescript
function maxProduct(nums: number[]): number {
  if (nums.length === 0) return 0;
  
  let max_so_far = nums[0];
  let min_so_far = nums[0];
  let result = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    let curr = nums[i];
    
    // When curr is negative, the potential maximum becomes the minimum, and vice versa.
    if (curr < 0) {
      let temp = max_so_far;
      max_so_far = min_so_far;
      min_so_far = temp;
    }
    
    max_so_far = Math.max(curr, max_so_far * curr);
    min_so_far = Math.min(curr, min_so_far * curr);
    
    result = Math.max(result, max_so_far);
  }
  
  return result;
}
```

**Complexity:**
- Time: **O(n)** — We iterate through the array of numbers exactly once.
- Space: **O(1)** — Only tracking a few integer variables.

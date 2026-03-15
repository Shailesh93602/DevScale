# Editorial — Find Minimum in Rotated Sorted Array

## Problem Summary

You are given an array of unique integers that was originally sorted in ascending order but has been rotated. You need to find the minimum element in **O(log n)** time.

---

## Approach 1 — Linear Search (Time Limit Exceeded / Suboptimal)

The easiest approach is just to loop through the array and find the minimum element. Because we are looking for the exact point where the sorted descending order breaks, we can return the first element that is smaller than its predecessor.

```typescript
function findMin(nums: number[]): number {
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] < nums[i - 1]) {
      return nums[i]; 
    }
  }
  return nums[0]; // the array isn't technically rotated at all
}
```

**Complexity:**
- Time: **O(n)** — In the worst-case, we iterate over the entire array. This violates the prompt's `O(log n)` requirement.
- Space: **O(1)**

---

## Approach 2 — Binary Search (Optimal O(log n) Time)

Any algorithm that requires a search in a sorted environment under an `O(log n)` limitation is crying out for **Binary Search**.

In a standard binary search, we maintain `left` and `right` pointers and check `nums[mid]`. For this problem, we compare `nums[mid]` against `nums[right]` to determine which half is properly sorted.

1. **If `nums[mid] > nums[right]`,** it means the minimum element must be to the right of `mid`. The sequence from `mid` to `right` crosses the rotation wrap-around point.
   - Example: `[4, 5, 6, 7, 0, 1, 2]`. Mid is `7`. `7 > 2`. Minimum is on the right side.
   - Action: `left = mid + 1`

2. **If `nums[mid] <= nums[right]`,** it means the sequence from `mid` to `right` is strictly ascending. Thus, the minimum value is either `nums[mid]` itself, or it lies to the left.
   - Example: `[5, 1, 2, 3, 4]`. Mid is `2`. `2 < 4`. Minimum is to the left or exactly the 2.
   - Action: `right = mid`

This loop narrows the bounds continually until `left == right`, at which point `nums[left]` is exactly our minimum element.

```typescript
function findMin(nums: number[]): number {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    let mid = Math.floor((left + right) / 2);

    if (nums[mid] > nums[right]) {
      // The min must be to the right
      left = mid + 1;
    } else {
      // The min is to the left, or it's the current mid
      right = mid;
    }
  }

  // left and right converge on the minimum element
  return nums[left];
}
```

**Complexity:**
- Time: **O(log n)** — We halve the search space at each iteration.
- Space: **O(1)** — Only a few pointers are used.

## Key Insight

When binary-searching through a rotated sorted array, **always compare `nums[mid]` exactly with `nums[right]`**. Comparing it to `nums[left]` brings complex edge cases when the subarray isn't rotated (meaning `nums[left] < nums[mid]`), which causes errors in narrowing. Comparing to `right` provides an absolute mathematical guarantee about which side holds the pivot point.

# Editorial — Search in Rotated Sorted Array

## Problem Summary

You are given an array of integers that was originally sorted in ascending order but has been rotated at an unknown pivot. You need to search for a `target` element and return its index. If not found, return `-1`. You must do this in **O(log n)** time.

---

## Approach 1 — Linear Search (Suboptimal O(n) Time)

You could simply iterate over the entire array to find the target. This ignores the sorted properties completely.

```typescript
function search(nums: number[], target: number): number {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) return i;
  }
  return -1;
}
```

**Complexity:**
- Time: **O(n)** — Too slow compared to the constraint.
- Space: **O(1)**

---

## Approach 2 — Modified Binary Search (Optimal O(log n) Time)

The `O(log n)` constraint strictly demands a Binary Search. The trick here is that, despite the rotation, **at least half of the array will always be perfectly sorted**. 

Algorithm:
1. Find `mid = Math.floor((left + right) / 2)`.
2. Check if `nums[mid]` is the target. If yes, return `mid`.
3. Check which half is sorted:
   - **Left half is sorted (`nums[left] <= nums[mid]`):**
     - Since the left side is cleanly sorted ascending, we can easily check if the target fits inside it.
     - **If `target >= nums[left]` AND `target < nums[mid]`:** The target belongs perfectly in this sorted left half. Move `right = mid - 1`.
     - **Else:** It's not in the perfect left half, so it must be in the funky right half. Move `left = mid + 1`.
   - **Right half is sorted (the above `if` failed):**
     - Since the right side is cleanly sorted ascending, check if the target fits inside it.
     - **If `target > nums[mid]` AND `target <= nums[right]`:** The target belongs perfectly in this sorted right half. Move `left = mid + 1`.
     - **Else:** It must be in the funky left half. Move `right = mid - 1`.

```typescript
function search(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) return mid;

    // Check if the Left half is strictly sorted
    if (nums[left] <= nums[mid]) {
      // Check if target is perfectly within the left sorted boundaries
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1; // It must be in the left half
      } else {
        left = mid + 1; // It must be in the right half
      }
    } 
    // Otherwise, the Right half must be strictly sorted
    else {
      // Check if target is perfectly within the right sorted boundaries
      if (target > nums[mid] && target <= nums[right]) {
        left = mid + 1; // It must be in the right half
      } else {
        right = mid - 1; // It must be in the left half
      }
    }
  }

  // Not found
  return -1;
}
```

**Complexity:**
- Time: **O(log n)** — Standard binary search division.
- Space: **O(1)** — No extra arrays or data structures allocated.

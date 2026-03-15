# Editorial — Container With Most Water

## Problem Summary

Given an array of heights, find two lines that together with the x-axis form a container that holds the most water. The container's width is the distance between the two lines, and its height is limited by the shorter of the two lines. The goal is to maximize `width * min(height_L, height_R)`.

---

## Approach 1 — Brute Force (Time Limit Exceeded)

Since we need a pair of lines, we could just calculate the amount of water trapped between *every possible pair* of lines, and return the maximum.

```typescript
function maxArea(height: number[]): number {
  let max_water = 0;
  
  for (let i = 0; i < height.length; i++) {
    for (let j = i + 1; j < height.length; j++) {
      let current_water = Math.min(height[i], height[j]) * (j - i);
      max_water = Math.max(max_water, current_water);
    }
  }
  
  return max_water;
}
```

**Complexity:**
- Time: **O(n²)** — Checking every valid pair. If `n = 10^5`, this means 10 billion operations. Too slow.
- Space: **O(1)**

---

## Approach 2 — Two Pointers / Greedy (Optimal O(n) Time)

Instead of checking every pair, what if we started with the absolute maximum width possible? 

We can place a pointer at the very beginning (`left = 0`) and one at the very end (`right = height.length - 1`). The water contained right now is `Math.min(height[left], height[right]) * (right - left)`.

At this point, how could we possibly find a *larger* container?
If we move either pointer inward, the width *strictly decreases* (from `n` to `n-1` to `n-2` etc.). The absolute **only way** the area could get larger despite shrinking width is if our new height climbs significantly higher.

The current container's height is tightly bottlenecked by the *shorter line*. Thus, moving the pointer of the *taller* line inward is useless—even if we find a taller line, the water level won't rise because it's still spilling over the other side's shorter line. It is mathematically guaranteed that retaining the shorter line while shrinking width will only decrease area. 

Therefore, our only hope to find a larger area is to **discard the shorter line** by moving its pointer inward, hoping to find a taller line to replace it.

**Algorithm:**
1. Initialize `max_water = 0`.
2. Initialize pointers `left = 0`, `right = height.length - 1`.
3. Loop until `left` and `right` meet:
   - Calculate current water and update `max_water`.
   - If `height[left] < height[right]`, shrink the window by `left++`.
   - If `height[right] <= height[left]`, shrink the window by `right--`.
4. Return `max_water`.

```typescript
function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let max_water = 0;

  while (left < right) {
    let width = right - left;
    let current_water = Math.min(height[left], height[right]) * width;
    
    max_water = Math.max(max_water, current_water);

    // Greedy decision: throw away the shorter edge!
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return max_water;
}
```

**Complexity:**
- Time: **O(n)** — We iterate progressively inward until the two pointers touch. Evaluates the list precisely once.
- Space: **O(1)** — Only recording pointers and our max variable.

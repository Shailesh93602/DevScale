# Editorial — Trapping Rain Water

## Problem Summary

Given an elevation map represented by an array of non-negative integers where the width of each bar is 1, calculate how much rainwater can be trapped above the bars after a rainstorm.

---

## Approach 1 — Brute Force (Time Limit Exceeded)

For any given position `i`, how much water sits on top of it?

Water can only be trapped if there are higher walls to its left and right. The exact amount of water on top of bar `i` is determined by the minimum of the highest wall to its left and the highest wall to its right, minus its own height.

`water_at_i = min(highest_left_wall, highest_right_wall) - height[i]` (if positive).

In the brute force approach, we recalculate `highest_left_wall` and `highest_right_wall` for every single element from scratch.

```typescript
function trap(height: number[]): number {
  let trapped = 0;
  
  for (let i = 0; i < height.length; i++) {
    let maxLeft = 0;
    let maxRight = 0;
    
    // Find the max height to the left
    for (let j = i; j >= 0; j--) {
      maxLeft = Math.max(maxLeft, height[j]);
    }
    
    // Find the max height to the right
    for (let j = i; j < height.length; j++) {
      maxRight = Math.max(maxRight, height[j]);
    }
    
    trapped += Math.min(maxLeft, maxRight) - height[i];
  }
  
  return trapped;
}
```

**Complexity:**
- Time: **O(n²)** — Finding the max left/right for every single element nested.
- Space: **O(1)**

---

## Approach 2 — Dynamic Programming (O(n) Time, O(n) Space)

We can avoid recalculating `maxLeft` and `maxRight` over and over by pre-computing them!

We make two arrays:
1. `maxLeftArray` where `maxLeftArray[i]` stores the max wall height to the left of `i`.
2. `maxRightArray` where `maxRightArray[i]` stores the max wall height to the right of `i`.

Then we just loop through the original array once more to sum up the trapped water using our pre-calculated arrays.

```typescript
function trap(height: number[]): number {
  if (height.length === 0) return 0;
  
  let trapped = 0;
  let n = height.length;
  let leftMax = new Array(n).fill(0);
  let rightMax = new Array(n).fill(0);
  
  leftMax[0] = height[0];
  for (let i = 1; i < n; i++) {
    leftMax[i] = Math.max(height[i], leftMax[i - 1]);
  }
  
  rightMax[n - 1] = height[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    rightMax[i] = Math.max(height[i], rightMax[i + 1]);
  }
  
  for (let i = 0; i < n; i++) {
    trapped += Math.min(leftMax[i], rightMax[i]) - height[i];
  }
  
  return trapped;
}
```

**Complexity:**
- Time: **O(n)** — 3 single passes through the array. 
- Space: **O(n)** — We allocated two arrays of size `n`.

---

## Approach 3 — Two Pointers (Optimal O(n) Time, O(1) Space)

Can we do this without the extra `O(n)` space? Yes, using two pointers moving inwards.

Instead of needing to know the *exact* max wall on both sides, notice we only care about the **smaller** of the two max walls (because water spills over the lower side).

If `maxLeft < maxRight`, we know the water level at the `left` pointer is bottlenecked by `maxLeft` regardless of what's further right. The opposite is true if `maxRight <= maxLeft`.

1. Start `left = 0`, `right = n - 1`.
2. Keep variables `maxLeft = 0`, `maxRight = 0`.
3. If `height[left] <= height[right]`:
   - If `height[left] >= maxLeft`, update `maxLeft = height[left]`. No water is trapped here (it's the new wall).
   - If `height[left] < maxLeft`, water is trapped! Add `maxLeft - height[left]` to total.
   - `left++`
4. If `height[right] < height[left]`:
   - Same logic but moving the `right` pointer inward.

**Complexity:**
- Time: **O(n)** — Single pass inward.
- Space: **O(1)** — No extra arrays allocated.

# Editorial — Largest Rectangle in Histogram

## Problem Summary

Find the area of the largest rectangle that can be formed in a histogram.

---

## Approach 1 — Brute Force (O(n^2) time)

For each bar, expand left and right while heights are >= current bar height.

**Complexity:** O(n^2) time. Too slow.

---

## Approach 2 — Monotonic Stack (O(n) time, O(n) space) ✅ Optimal

Maintain a stack of indices with increasing heights. When a shorter bar is encountered, pop and calculate the area using the popped bar as the height.

```typescript
function largestRectangleArea(heights: number[]): number {
  const stack: number[] = [];
  let maxArea = 0;
  const n = heights.length;

  for (let i = 0; i <= n; i++) {
    const h = i === n ? 0 : heights[i];
    while (stack.length > 0 && h < heights[stack[stack.length - 1]]) {
      const height = heights[stack.pop()!];
      const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      maxArea = Math.max(maxArea, height * width);
    }
    stack.push(i);
  }

  return maxArea;
}
```

**Complexity:**
- Time: **O(n)** — each bar pushed and popped at most once.
- Space: **O(n)** — stack.

---

## Key Insight

For each bar, we need to know how far left and right it can extend. A monotonic increasing stack naturally gives us this: when we pop a bar, the current index is the right boundary and the new stack top is the left boundary.

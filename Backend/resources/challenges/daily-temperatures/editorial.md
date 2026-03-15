# Editorial — Daily Temperatures

## Problem Summary

For each day, find how many days until a warmer temperature. Classic monotonic stack problem.

---

## Approach 1 — Brute Force (O(n^2) time, O(1) space)

For each day, scan forward to find the next warmer day.

**Complexity:** O(n^2) time. Too slow for n = 10^5.

---

## Approach 2 — Monotonic Stack (O(n) time, O(n) space) ✅ Optimal

Maintain a stack of indices with decreasing temperatures. When a warmer temperature is found, pop indices and compute the difference.

```typescript
function dailyTemperatures(temperatures: number[]): number[] {
  const n = temperatures.length;
  const answer = new Array(n).fill(0);
  const stack: number[] = []; // indices

  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const idx = stack.pop()!;
      answer[idx] = i - idx;
    }
    stack.push(i);
  }

  return answer;
}
```

**Complexity:**
- Time: **O(n)** — each index is pushed and popped at most once.
- Space: **O(n)** — stack.

---

## Key Insight

A monotonic decreasing stack efficiently finds the "next greater element." When a new temperature is higher than the stack's top, all elements on the stack that are cooler have found their next warmer day.

# Editorial — Burst Balloons

## Problem Summary

Burst balloons to maximize coins. When balloon `i` is burst, you get `nums[i-1] * nums[i] * nums[i+1]` coins. The key insight is thinking about which balloon to burst **last** in a range.

---

## Approach 1 — Interval DP (Optimal) ✅

Instead of thinking about which balloon to burst first, think about which to burst **last** in the interval `(left, right)`.

Pad the array with 1s on both ends. `dp[left][right]` = max coins from bursting all balloons between `left` and `right` (exclusive).

```typescript
function maxCoins(nums: number[]): number {
  const n = nums.length;
  const arr = [1, ...nums, 1]; // pad with 1s
  const dp: number[][] = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0));

  for (let len = 1; len <= n; len++) {
    for (let left = 0; left <= n - len; left++) {
      const right = left + len + 1;
      for (let k = left + 1; k < right; k++) {
        // k is the last balloon to burst in range (left, right)
        dp[left][right] = Math.max(
          dp[left][right],
          dp[left][k] + arr[left] * arr[k] * arr[right] + dp[k][right]
        );
      }
    }
  }

  return dp[0][n + 1];
}
```

**Complexity:**
- Time: **O(n^3)** — Three nested loops.
- Space: **O(n^2)** — 2D DP table.

---

## Key Insight

The trick is to think **backwards**: instead of choosing which balloon to burst first (which changes neighbors), think about which balloon to burst **last** in a range. When balloon `k` is the last burst in range `(left, right)`, the boundaries `left` and `right` are still intact, so the coin value is `arr[left] * arr[k] * arr[right]`. This makes subproblems independent.

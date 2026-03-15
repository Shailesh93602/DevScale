# Editorial — Min Cost Climbing Stairs

## Problem Summary

Find the minimum cost to reach the top, where you can start from step 0 or 1 and take 1 or 2 steps each time.

---

## Approach 1 — Bottom-Up DP

`dp[i]` = minimum cost to reach step `i`.

```typescript
function minCostClimbingStairs(cost: number[]): number {
  const n = cost.length;
  const dp: number[] = new Array(n + 1).fill(0);
  for (let i = 2; i <= n; i++) {
    dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);
  }
  return dp[n];
}
```

**Complexity:**
- Time: **O(n)**
- Space: **O(n)**

---

## Approach 2 — Space-Optimized (Optimal) ✅

```typescript
function minCostClimbingStairs(cost: number[]): number {
  let prev2 = 0, prev1 = 0;
  for (let i = 2; i <= cost.length; i++) {
    const current = Math.min(prev1 + cost[i - 1], prev2 + cost[i - 2]);
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}
```

**Complexity:**
- Time: **O(n)**
- Space: **O(1)**

---

## Key Insight

To reach step `i`, you could have come from step `i-1` (paying `cost[i-1]`) or step `i-2` (paying `cost[i-2]`). The "top" is one step beyond the last element.

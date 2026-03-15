# Editorial — Coin Change

## Problem Summary

Given coin denominations and a target amount, find the minimum number of coins needed. This is the classic unbounded knapsack / minimum coin change problem.

---

## Approach 1 — Recursion with Memoization (Top-Down)

For each amount, try every coin and recursively solve for the remaining amount.

```typescript
function coinChange(coins: number[], amount: number): number {
  const memo = new Map<number, number>();

  function dp(rem: number): number {
    if (rem === 0) return 0;
    if (rem < 0) return Infinity;
    if (memo.has(rem)) return memo.get(rem)!;

    let minCoins = Infinity;
    for (const coin of coins) {
      const res = dp(rem - coin);
      minCoins = Math.min(minCoins, res + 1);
    }
    memo.set(rem, minCoins);
    return minCoins;
  }

  const result = dp(amount);
  return result === Infinity ? -1 : result;
}
```

**Complexity:**
- Time: **O(amount * coins.length)** — Each subproblem solved once.
- Space: **O(amount)** — Memoization table.

---

## Approach 2 — Bottom-Up DP (Optimal) ✅

Build a table `dp[i]` = minimum coins to make amount `i`.

```typescript
function coinChange(coins: number[], amount: number): number {
  const dp: number[] = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}
```

**Complexity:**
- Time: **O(amount * coins.length)**
- Space: **O(amount)**

---

## Key Insight

This is a classic DP problem where `dp[i]` depends on `dp[i - coin]` for each coin. The greedy approach (always pick the largest coin) does NOT work here. For example, coins = [1, 5, 11], amount = 15: greedy gives 11+1+1+1+1 = 5 coins, but optimal is 5+5+5 = 3 coins.

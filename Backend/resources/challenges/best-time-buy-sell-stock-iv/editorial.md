# Editorial — Best Time to Buy and Sell Stock IV

## Problem Summary

Generalization of Stock III: at most k transactions.

---

## Optimal Approach ✅

If k >= n/2, it's unlimited transactions (greedy). Otherwise, use DP with k transactions.

```typescript
function maxProfit(k: number, prices: number[]): number {
  const n = prices.length;
  if (k >= Math.floor(n / 2)) {
    let profit = 0;
    for (let i = 1; i < n; i++) {
      if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1];
    }
    return profit;
  }

  const buy = new Array(k + 1).fill(-Infinity);
  const sell = new Array(k + 1).fill(0);

  for (const price of prices) {
    for (let j = 1; j <= k; j++) {
      buy[j] = Math.max(buy[j], sell[j - 1] - price);
      sell[j] = Math.max(sell[j], buy[j] + price);
    }
  }

  return sell[k];
}
```

**Complexity:** Time: O(n*k), Space: O(k)

---

## Key Insight

Generalize the state machine from Stock III: track k buy/sell pairs. When k >= n/2, fall back to the greedy unlimited-transactions solution.

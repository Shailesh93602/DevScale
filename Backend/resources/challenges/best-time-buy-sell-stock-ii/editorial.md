# Editorial — Best Time to Buy and Sell Stock II

## Problem Summary

Maximize profit with unlimited buy/sell transactions (cannot hold multiple shares).

---

## Optimal Approach — Greedy ✅

Collect every upward price movement. If tomorrow's price is higher than today's, capture that profit.

```typescript
function maxProfit(prices: number[]): number {
  let profit = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      profit += prices[i] - prices[i - 1];
    }
  }
  return profit;
}
```

**Complexity:** Time: O(n), Space: O(1)

---

## Key Insight

With unlimited transactions, collecting every positive price difference is optimal. This is equivalent to buying at every local minimum and selling at every local maximum.

# Editorial — Best Time to Buy and Sell Stock III

## Problem Summary

Maximum profit with at most 2 buy-sell transactions. Cannot hold multiple shares simultaneously.

---

## Optimal Approach — State Machine ✅

Track 4 states: after 1st buy, after 1st sell, after 2nd buy, after 2nd sell.

```typescript
function maxProfit(prices: number[]): number {
  let buy1 = -Infinity, sell1 = 0;
  let buy2 = -Infinity, sell2 = 0;

  for (const price of prices) {
    buy1 = Math.max(buy1, -price);
    sell1 = Math.max(sell1, buy1 + price);
    buy2 = Math.max(buy2, sell1 - price);
    sell2 = Math.max(sell2, buy2 + price);
  }

  return sell2;
}
```

**Complexity:** Time: O(n), Space: O(1)

---

## Key Insight

Model the problem as a state machine with states for each buy/sell. The 2nd buy uses the profit from the 1st sell as starting capital. This generalizes to k transactions.

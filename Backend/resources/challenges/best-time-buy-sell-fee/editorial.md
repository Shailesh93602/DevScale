# Editorial — Best Time to Buy and Sell Stock with Transaction Fee

## Optimal Approach ✅

Two states: holding and not holding stock.

```typescript
function maxProfit(prices: number[], fee: number): number {
  let cash = 0;      // max profit when NOT holding stock
  let hold = -prices[0]; // max profit when holding stock
  for (let i = 1; i < prices.length; i++) {
    cash = Math.max(cash, hold + prices[i] - fee);
    hold = Math.max(hold, cash - prices[i]);
  }
  return cash;
}
```

**Complexity:** Time: O(n), Space: O(1)

## Key Insight
Same as Stock II but subtract the fee when selling. The fee prevents small unprofitable trades.

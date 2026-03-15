# Editorial — Best Time to Buy and Sell Stock

## Problem Summary

Find the maximum difference `prices[j] - prices[i]` such that `i < j`. You are essentially looking for the maximum profit you can make from buying once and selling once.

---

## Approach 1 — Brute Force (Time Limit Exceeded)

Check every possible pair of `(buy_day, sell_day)` where `buy_day < sell_day`.

```typescript
function maxProfit(prices: number[]): number {
  let max_profit = 0;
  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      let profit = prices[j] - prices[i];
      if (profit > max_profit) {
        max_profit = profit;
      }
    }
  }
  return max_profit;
}
```

**Complexity:**
- Time: **O(n²)** — Two nested loops. For `n = 10^5`, this takes up to 10^10 operations (too slow!).
- Space: **O(1)**

---

## Approach 2 — One Pass (Optimal approach using Greedy strategy)

Instead of checking every pair, what if we keep track of the **lowest price we've seen so far**?
If we are at day `j`, the best day to have bought the stock to maximize our profit today would be whichever day before `j` had the absolute lowest price.

**Algorithm:**
1. Initialize `min_price` to infinity, and `max_profit` to 0.
2. Iterate through `prices`.
3. If the current price is lower than `min_price`, update `min_price`.
4. Otherwise (if the current price is higher), check if selling today yields a better profit than our current `max_profit` (`current_price - min_price > max_profit`). If so, update `max_profit`.
5. Return `max_profit`.

```typescript
function maxProfit(prices: number[]): number {
  let min_price = Infinity;
  let max_profit = 0;
  
  for (let i = 0; i < prices.length; i++) {
    if (prices[i] < min_price) {
      min_price = prices[i]; // Found a new day to buy at a lower price
    } else if (prices[i] - min_price > max_profit) {
      max_profit = prices[i] - min_price; // Selling today gives us more profit!
    }
  }
  
  return max_profit;
}
```

**Complexity:**
- Time: **O(n)** — We iterate through the array of prices exactly once.
- Space: **O(1)** — We only use two variables to keep track of state.

---

## Key Insight

This problem highlights a very common pattern: **tracking a "best so far" statistic**. Instead of continually looking backwards across the entire history, carry the single most important piece of past information forward with you (in this case, `min_price`).

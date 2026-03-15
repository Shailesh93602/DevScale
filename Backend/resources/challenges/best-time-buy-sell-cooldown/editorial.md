# Editorial — Best Time to Buy and Sell Stock with Cooldown

## Problem Summary

Maximize profit with unlimited transactions but a 1-day cooldown after selling.

---

## Optimal Approach — State Machine ✅

Three states: held (holding stock), sold (just sold), rest (cooldown/idle).

```typescript
function maxProfit(prices: number[]): number {
  let held = -Infinity, sold = 0, rest = 0;
  for (const price of prices) {
    const prevHeld = held;
    held = Math.max(held, rest - price);    // buy or keep holding
    rest = Math.max(rest, sold);             // cooldown or stay resting
    sold = prevHeld + price;                 // sell today
  }
  return Math.max(sold, rest);
}
```

**Complexity:** Time: O(n), Space: O(1)

---

## Key Insight

After selling, you must wait one day before buying. Model as a state machine: held -> sold -> rest -> held. The "rest" state enforces the cooldown.

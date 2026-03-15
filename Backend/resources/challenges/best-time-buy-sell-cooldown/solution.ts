// Optimal: O(n) Time, O(1) Space - State machine
function maxProfit(prices: number[]): number {
  let held = -Infinity, sold = 0, rest = 0;
  for (const price of prices) {
    const prevHeld = held;
    held = Math.max(held, rest - price);
    rest = Math.max(rest, sold);
    sold = prevHeld + price;
  }
  return Math.max(sold, rest);
}

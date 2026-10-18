// Optimal: O(n) Time, O(1) Space - State machine with 4 states
function maxProfit(prices: number[]): number {
  let buy1 = -Infinity, sell1 = 0;
  let buy2 = -Infinity, sell2 = 0;

  for (const price of prices) {
    buy1 = Math.max(buy1, -price);           // best cost for 1st buy
    sell1 = Math.max(sell1, buy1 + price);    // best profit after 1st sell
    buy2 = Math.max(buy2, sell1 - price);     // best cost for 2nd buy (using 1st profit)
    sell2 = Math.max(sell2, buy2 + price);    // best profit after 2nd sell
  }

  return sell2;
}

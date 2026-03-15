# Best Time to Buy and Sell Stock with Transaction Fee

You are given an array `prices` where `prices[i]` is the price of a given stock on the `ith` day, and an integer `fee` representing a transaction fee.

Find the maximum profit you can achieve. You may complete as many transactions as you like, but you need to pay the transaction fee for each transaction. You may not engage in multiple transactions simultaneously.

---

## Examples

**Example 1:**
```text
Input: prices = [1,3,2,8,4,9], fee = 2
Output: 8
Explanation: Buy day 1 (price=1), sell day 4 (price=8), profit=8-1-2=5.
Buy day 5 (price=4), sell day 6 (price=9), profit=9-4-2=3. Total=8.
```

**Example 2:**
```text
Input: prices = [1,3,7,5,10,3], fee = 3
Output: 6
Explanation: Buy day 1, sell day 5, profit=10-1-3=6.
```

---

## Constraints

- `1 <= prices.length <= 5 * 10^4`
- `1 <= prices[i] < 5 * 10^4`
- `0 <= fee < 5 * 10^4`

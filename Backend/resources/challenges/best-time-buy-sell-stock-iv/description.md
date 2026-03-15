# Best Time to Buy and Sell Stock IV

You are given an integer array `prices` where `prices[i]` is the price of a given stock on the `ith` day, and an integer `k`.

Find the maximum profit you can achieve. You may complete **at most `k` transactions**.

**Note:** You may not engage in multiple transactions simultaneously.

---

## Examples

**Example 1:**
```text
Input: k = 2, prices = [2,4,1]
Output: 2
Explanation: Buy on day 1 (price=2), sell on day 2 (price=4), profit=2.
```

**Example 2:**
```text
Input: k = 2, prices = [3,2,6,5,0,3]
Output: 7
Explanation: Buy day 2 (price=2), sell day 3 (price=6), profit=4.
Buy day 5 (price=0), sell day 6 (price=3), profit=3. Total=7.
```

---

## Constraints

- `1 <= k <= 100`
- `1 <= prices.length <= 1000`
- `0 <= prices[i] <= 1000`

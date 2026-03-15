# Coin Change

You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.

Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return `-1`.

You may assume that you have an infinite number of each kind of coin.

---

## Examples

**Example 1:**
```text
Input: coins = [1,5,11], amount = 11
Output: 1
Explanation: 11 = 11
```

**Example 2:**
```text
Input: coins = [2], amount = 3
Output: -1
Explanation: Cannot make 3 with only coins of value 2.
```

**Example 3:**
```text
Input: coins = [1], amount = 0
Output: 0
Explanation: No coins needed for amount 0.
```

---

## Constraints

- `1 <= coins.length <= 12`
- `1 <= coins[i] <= 2^31 - 1`
- `0 <= amount <= 10^4`

# House Robber

You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that **adjacent houses have security systems connected** and it will automatically contact the police if **two adjacent houses were broken into on the same night**.

Given an integer array `nums` representing the amount of money of each house, return *the maximum amount of money you can rob tonight without alerting the police*.

---

## Examples

**Example 1:**
```text
Input: nums = [1,2,3,1]
Output: 4
Explanation: Rob house 1 (money = 1) and then rob house 3 (money = 3).
Total amount = 1 + 3 = 4.
```

**Example 2:**
```text
Input: nums = [2,7,9,3,1]
Output: 12
Explanation: Rob house 1 (money = 2), rob house 3 (money = 9) and rob house 5 (money = 1).
Total amount = 2 + 9 + 1 = 12.
```

**Example 3:**
```text
Input: nums = [2,1,1,2]
Output: 4
Explanation: Rob house 1 (money = 2) and house 4 (money = 2).
Total amount = 2 + 2 = 4.
```

---

## Constraints

- `1 <= nums.length <= 100`
- `0 <= nums[i] <= 400`

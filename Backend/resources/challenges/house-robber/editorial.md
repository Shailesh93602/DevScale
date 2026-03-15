# Editorial — House Robber

## Problem Summary

Given an array of non-negative integers representing the amount of money at each house, find the maximum amount you can rob such that no two adjacent houses are robbed.

---

## Approach 1 — Recursion (Brute Force)

For each house, decide to rob it or skip it. If you rob house `i`, you cannot rob house `i+1`.

```typescript
function rob(nums: number[]): number {
  function helper(i: number): number {
    if (i >= nums.length) return 0;
    return Math.max(nums[i] + helper(i + 2), helper(i + 1));
  }
  return helper(0);
}
```

**Complexity:**
- Time: **O(2^n)** — Each house has two choices.
- Space: **O(n)** — Recursion stack.

---

## Approach 2 — Dynamic Programming (Bottom-Up)

Define `dp[i]` as the maximum money we can rob from the first `i` houses.

```typescript
function rob(nums: number[]): number {
  const n = nums.length;
  if (n === 1) return nums[0];
  const dp: number[] = new Array(n);
  dp[0] = nums[0];
  dp[1] = Math.max(nums[0], nums[1]);
  for (let i = 2; i < n; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
  }
  return dp[n - 1];
}
```

**Complexity:**
- Time: **O(n)**
- Space: **O(n)**

---

## Approach 3 — Space-Optimized DP (Optimal) ✅

We only need the last two values, so use two variables.

```typescript
function rob(nums: number[]): number {
  let prev2 = 0;
  let prev1 = 0;
  for (const num of nums) {
    const current = Math.max(prev1, prev2 + num);
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}
```

**Complexity:**
- Time: **O(n)** — Single pass.
- Space: **O(1)** — Two variables.

---

## Key Insight

At each house, you have exactly two choices: rob it (and add its value to the best you could do skipping the previous house) or skip it (and keep the best you could do including or excluding the previous house). This leads to the recurrence: `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`.

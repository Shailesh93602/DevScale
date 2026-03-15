# Editorial — Target Sum

## Problem Summary

Assign `+` or `-` to each number and count ways to reach a target sum. This can be reduced to a subset sum problem.

---

## Approach 1 — Recursion (Brute Force)

Try both `+` and `-` for each number.

```typescript
function findTargetSumWays(nums: number[], target: number): number {
  function dfs(i: number, sum: number): number {
    if (i === nums.length) return sum === target ? 1 : 0;
    return dfs(i + 1, sum + nums[i]) + dfs(i + 1, sum - nums[i]);
  }
  return dfs(0, 0);
}
```

**Complexity:**
- Time: **O(2^n)**
- Space: **O(n)**

---

## Approach 2 — DP with Subset Sum Reduction (Optimal) ✅

Let P = subset with `+` signs, N = subset with `-` signs.
- P + N = totalSum
- P - N = target
- P = (totalSum + target) / 2

So we need to count subsets that sum to `(totalSum + target) / 2`.

```typescript
function findTargetSumWays(nums: number[], target: number): number {
  const total = nums.reduce((a, b) => a + b, 0);
  if ((total + target) % 2 !== 0 || Math.abs(target) > total) return 0;
  const subsetSum = (total + target) / 2;

  const dp: number[] = new Array(subsetSum + 1).fill(0);
  dp[0] = 1;

  for (const num of nums) {
    for (let j = subsetSum; j >= num; j--) {
      dp[j] += dp[j - num];
    }
  }

  return dp[subsetSum];
}
```

**Complexity:**
- Time: **O(n * subsetSum)**
- Space: **O(subsetSum)**

---

## Key Insight

The mathematical transformation from `+/-` assignment to subset sum is the key. By letting P be the sum of positive numbers: `P = (total + target) / 2`. If this isn't an integer or is negative, the answer is 0. This transforms an exponential backtracking problem into a polynomial DP problem.

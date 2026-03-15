# Editorial — Partition Equal Subset Sum

## Problem Summary

Determine if an array can be split into two subsets with equal sum. This reduces to: can we find a subset that sums to `totalSum / 2`?

---

## Approach 1 — Recursion (Brute Force)

Try including or excluding each element to reach the target sum.

```typescript
function canPartition(nums: number[]): boolean {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false;
  const target = total / 2;

  function dfs(i: number, remaining: number): boolean {
    if (remaining === 0) return true;
    if (i >= nums.length || remaining < 0) return false;
    return dfs(i + 1, remaining - nums[i]) || dfs(i + 1, remaining);
  }

  return dfs(0, target);
}
```

**Complexity:**
- Time: **O(2^n)**
- Space: **O(n)**

---

## Approach 2 — 1D DP (0/1 Knapsack) (Optimal) ✅

Use a boolean DP array where `dp[j]` = true if sum `j` is achievable.

```typescript
function canPartition(nums: number[]): boolean {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false;
  const target = total / 2;

  const dp: boolean[] = new Array(target + 1).fill(false);
  dp[0] = true;

  for (const num of nums) {
    for (let j = target; j >= num; j--) {
      dp[j] = dp[j] || dp[j - num];
    }
  }

  return dp[target];
}
```

**Complexity:**
- Time: **O(n * target)** where target = sum/2
- Space: **O(target)**

---

## Key Insight

If the total sum is odd, it's impossible to partition into equal halves. Otherwise, this becomes a 0/1 knapsack problem: can we pick a subset that sums to `total/2`? The key trick in 1D DP is iterating `j` from right to left so each number is used at most once.

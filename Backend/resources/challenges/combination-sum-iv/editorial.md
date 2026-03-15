# Editorial — Combination Sum IV

## Problem Summary

Count the number of ordered sequences from `nums` that sum to `target`. Order matters, making this a permutation problem rather than a traditional combination problem.

---

## Approach 1 — Recursion (Brute Force)

Try every number at each step and recurse on the remaining target.

```typescript
function combinationSum4(nums: number[], target: number): number {
  if (target === 0) return 1;
  let count = 0;
  for (const num of nums) {
    if (num <= target) {
      count += combinationSum4(nums, target - num);
    }
  }
  return count;
}
```

**Complexity:**
- Time: **Exponential**
- Space: **O(target)** — Recursion depth.

---

## Approach 2 — Bottom-Up DP (Optimal) ✅

Define `dp[i]` = number of ways to form sum `i`. For each amount from 1 to target, try every number in nums.

```typescript
function combinationSum4(nums: number[], target: number): number {
  const dp: number[] = new Array(target + 1).fill(0);
  dp[0] = 1;

  for (let i = 1; i <= target; i++) {
    for (const num of nums) {
      if (num <= i) {
        dp[i] += dp[i - num];
      }
    }
  }

  return dp[target];
}
```

**Complexity:**
- Time: **O(target * nums.length)**
- Space: **O(target)**

---

## Key Insight

This is essentially the "climbing stairs" problem generalized: instead of steps of 1 and 2, you can take steps of any size in `nums`. The outer loop iterates over amounts (not coins), which counts permutations rather than combinations. If we wanted combinations (order doesn't matter), the outer loop would iterate over coins instead.

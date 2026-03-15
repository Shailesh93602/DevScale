# Editorial — House Robber II

## Problem Summary

Same as House Robber, but houses are arranged in a circle, meaning the first and last houses are adjacent. We cannot rob both the first and last house.

---

## Approach 1 — Reduce to House Robber I

The circular constraint means we cannot rob both house 0 and house n-1. So we split into two subproblems:
1. Rob houses `0` to `n-2` (exclude last)
2. Rob houses `1` to `n-1` (exclude first)

Take the maximum of both results.

```typescript
function rob(nums: number[]): number {
  const n = nums.length;
  if (n === 1) return nums[0];
  if (n === 2) return Math.max(nums[0], nums[1]);

  function robLinear(start: number, end: number): number {
    let prev2 = 0;
    let prev1 = 0;
    for (let i = start; i <= end; i++) {
      const current = Math.max(prev1, prev2 + nums[i]);
      prev2 = prev1;
      prev1 = current;
    }
    return prev1;
  }

  return Math.max(robLinear(0, n - 2), robLinear(1, n - 1));
}
```

**Complexity:**
- Time: **O(n)** — Two linear passes.
- Space: **O(1)** — Only variables.

---

## Optimal Approach ✅

The approach above is already optimal. The key insight is reducing the circular problem to two linear House Robber problems.

```typescript
function rob(nums: number[]): number {
  const n = nums.length;
  if (n === 1) return nums[0];
  if (n === 2) return Math.max(nums[0], nums[1]);

  function robRange(start: number, end: number): number {
    let prev2 = 0;
    let prev1 = 0;
    for (let i = start; i <= end; i++) {
      const current = Math.max(prev1, prev2 + nums[i]);
      prev2 = prev1;
      prev1 = current;
    }
    return prev1;
  }

  return Math.max(robRange(0, n - 2), robRange(1, n - 1));
}
```

**Complexity:**
- Time: **O(n)**
- Space: **O(1)**

---

## Key Insight

The circular arrangement means house 0 and house n-1 are adjacent. If we rob house 0, we cannot rob house n-1, and vice versa. By splitting into two linear subproblems (one excluding the first house, one excluding the last), we cover all valid combinations and reduce to a solved problem.

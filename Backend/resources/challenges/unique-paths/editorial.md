# Editorial — Unique Paths

## Problem Summary

Count the number of paths from top-left to bottom-right in an m x n grid, moving only right or down.

---

## Approach 1 — 2D DP

`dp[i][j]` = number of ways to reach cell (i, j). A cell can only be reached from above or from the left.

```typescript
function uniquePaths(m: number, n: number): number {
  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(1));

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }

  return dp[m - 1][n - 1];
}
```

**Complexity:**
- Time: **O(m * n)**
- Space: **O(m * n)**

---

## Approach 2 — 1D DP (Optimal) ✅

Since each row only depends on the current and previous row, use a single 1D array.

```typescript
function uniquePaths(m: number, n: number): number {
  const dp: number[] = new Array(n).fill(1);

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[j] += dp[j - 1];
    }
  }

  return dp[n - 1];
}
```

**Complexity:**
- Time: **O(m * n)**
- Space: **O(n)**

---

## Approach 3 — Combinatorics

The robot must make exactly `(m-1)` down moves and `(n-1)` right moves. The answer is C(m+n-2, m-1).

```typescript
function uniquePaths(m: number, n: number): number {
  let result = 1;
  for (let i = 1; i <= m - 1; i++) {
    result = result * (n - 1 + i) / i;
  }
  return Math.round(result);
}
```

**Complexity:**
- Time: **O(min(m, n))**
- Space: **O(1)**

---

## Key Insight

This is equivalent to choosing which of the `(m+n-2)` total moves are "down" moves (or equivalently "right" moves). The DP approach builds this naturally: each cell's paths = paths from above + paths from left.

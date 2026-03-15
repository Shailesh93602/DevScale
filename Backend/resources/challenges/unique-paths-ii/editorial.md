# Editorial — Unique Paths II

## Problem Summary

Same as Unique Paths but with obstacles. Cells with obstacles have 0 paths through them.

---

## Approach 1 — 2D DP

Same as Unique Paths, but set `dp[i][j] = 0` for obstacle cells.

```typescript
function uniquePathsWithObstacles(obstacleGrid: number[][]): number {
  const m = obstacleGrid.length, n = obstacleGrid[0].length;
  if (obstacleGrid[0][0] === 1 || obstacleGrid[m - 1][n - 1] === 1) return 0;

  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  dp[0][0] = 1;

  for (let i = 1; i < m; i++) dp[i][0] = obstacleGrid[i][0] === 1 ? 0 : dp[i - 1][0];
  for (let j = 1; j < n; j++) dp[0][j] = obstacleGrid[0][j] === 1 ? 0 : dp[0][j - 1];

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = obstacleGrid[i][j] === 1 ? 0 : dp[i - 1][j] + dp[i][j - 1];
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

```typescript
function uniquePathsWithObstacles(obstacleGrid: number[][]): number {
  const m = obstacleGrid.length, n = obstacleGrid[0].length;
  if (obstacleGrid[0][0] === 1) return 0;

  const dp: number[] = new Array(n).fill(0);
  dp[0] = 1;

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (obstacleGrid[i][j] === 1) {
        dp[j] = 0;
      } else if (j > 0) {
        dp[j] += dp[j - 1];
      }
    }
  }

  return dp[n - 1];
}
```

**Complexity:**
- Time: **O(m * n)**
- Space: **O(n)**

---

## Key Insight

The only difference from Unique Paths is that obstacle cells contribute 0 paths. When using 1D DP, simply set `dp[j] = 0` when hitting an obstacle. Otherwise, the same recurrence applies.

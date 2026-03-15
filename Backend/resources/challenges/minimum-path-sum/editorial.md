# Editorial — Minimum Path Sum

## Optimal Approach ✅

dp[i][j] = min cost to reach (i,j). Can modify grid in-place.

```typescript
function minPathSum(grid: number[][]): number {
  const m = grid.length, n = grid[0].length;
  for (let i = 1; i < m; i++) grid[i][0] += grid[i-1][0];
  for (let j = 1; j < n; j++) grid[0][j] += grid[0][j-1];
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      grid[i][j] += Math.min(grid[i-1][j], grid[i][j-1]);
    }
  }
  return grid[m-1][n-1];
}
```

**Complexity:** Time: O(m*n), Space: O(1) (in-place)

## Key Insight
Each cell can only be reached from above or left. Take the minimum of those two paths plus current cell value.

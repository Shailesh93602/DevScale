// Optimal approach: O(m*n) Time, O(n) Space
// 1D DP with obstacle handling
function uniquePathsWithObstacles(obstacleGrid: number[][]): number {
  const m = obstacleGrid.length, n = obstacleGrid[0].length;
  if (obstacleGrid[0][0] === 1) return 0;

  const dp: number[] = new Array(n).fill(0);
  dp[0] = 1;

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (obstacleGrid[i][j] === 1) {
        dp[j] = 0; // obstacle: no paths through here
      } else if (j > 0) {
        dp[j] += dp[j - 1]; // paths from above (already in dp[j]) + paths from left
      }
    }
  }

  return dp[n - 1];
}

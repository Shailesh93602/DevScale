// Optimal approach: O(m*n) Time, O(n) Space
// 1D DP: dp[j] accumulates paths from above (previous row) and left
function uniquePaths(m: number, n: number): number {
  const dp: number[] = new Array(n).fill(1);

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[j] += dp[j - 1];
    }
  }

  return dp[n - 1];
}

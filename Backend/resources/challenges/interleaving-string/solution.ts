// Optimal approach: O(m*n) Time, O(m*n) Space
// 2D DP: dp[i][j] = can s3[0..i+j-1] be formed from s1[0..i-1] and s2[0..j-1]?
function isInterleave(s1: string, s2: string, s3: string): boolean {
  const m = s1.length, n = s2.length;
  if (m + n !== s3.length) return false;

  const dp: boolean[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;

  // First column: only using s1
  for (let i = 1; i <= m; i++) dp[i][0] = dp[i - 1][0] && s1[i - 1] === s3[i - 1];
  // First row: only using s2
  for (let j = 1; j <= n; j++) dp[0][j] = dp[0][j - 1] && s2[j - 1] === s3[j - 1];

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = (dp[i - 1][j] && s1[i - 1] === s3[i + j - 1]) ||
                 (dp[i][j - 1] && s2[j - 1] === s3[i + j - 1]);
    }
  }

  return dp[m][n];
}

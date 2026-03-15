// Optimal approach: O(n^2) Time, O(n) Space
// dp[i] = true if s[0..i-1] can be segmented into dictionary words
function wordBreak(s: string, wordDict: string[]): boolean {
  const wordSet = new Set(wordDict);
  const n = s.length;
  const dp: boolean[] = new Array(n + 1).fill(false);
  dp[0] = true; // empty string is always valid

  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && wordSet.has(s.substring(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }

  return dp[n];
}

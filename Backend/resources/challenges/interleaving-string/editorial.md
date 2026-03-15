# Editorial — Interleaving String

## Problem Summary

Determine if `s3` can be formed by interleaving `s1` and `s2`, maintaining relative order within each string.

---

## Approach 1 — 2D DP (Optimal) ✅

`dp[i][j]` = true if `s3[0..i+j-1]` can be formed by interleaving `s1[0..i-1]` and `s2[0..j-1]`.

```typescript
function isInterleave(s1: string, s2: string, s3: string): boolean {
  const m = s1.length, n = s2.length;
  if (m + n !== s3.length) return false;

  const dp: boolean[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;

  for (let i = 1; i <= m; i++) dp[i][0] = dp[i - 1][0] && s1[i - 1] === s3[i - 1];
  for (let j = 1; j <= n; j++) dp[0][j] = dp[0][j - 1] && s2[j - 1] === s3[j - 1];

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = (dp[i - 1][j] && s1[i - 1] === s3[i + j - 1]) ||
                 (dp[i][j - 1] && s2[j - 1] === s3[i + j - 1]);
    }
  }

  return dp[m][n];
}
```

**Complexity:**
- Time: **O(m * n)**
- Space: **O(m * n)** (can be O(n) with 1D DP)

---

## Key Insight

At position `(i, j)`, we've used `i` characters from `s1` and `j` characters from `s2`, which means we're looking at `s3[i+j-1]`. This character must come from either `s1[i-1]` (if `dp[i-1][j]` was valid) or `s2[j-1]` (if `dp[i][j-1]` was valid).

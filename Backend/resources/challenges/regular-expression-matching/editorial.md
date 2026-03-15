# Editorial — Regular Expression Matching

## Problem Summary

Implement regex matching with `.` (any char) and `*` (zero or more of preceding). Must match the entire string.

---

## Approach 1 — 2D DP (Optimal) ✅

`dp[i][j]` = does `s[0..i-1]` match `p[0..j-1]`?

```typescript
function isMatch(s: string, p: string): boolean {
  const m = s.length, n = p.length;
  const dp: boolean[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;

  // Handle patterns like a*, a*b*, .* that can match empty string
  for (let j = 2; j <= n; j++) {
    if (p[j - 1] === '*') {
      dp[0][j] = dp[0][j - 2];
    }
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === '*') {
        // Zero occurrences of the preceding element
        dp[i][j] = dp[i][j - 2];
        // One or more occurrences (if char matches)
        if (p[j - 2] === '.' || p[j - 2] === s[i - 1]) {
          dp[i][j] = dp[i][j] || dp[i - 1][j];
        }
      } else if (p[j - 1] === '.' || p[j - 1] === s[i - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      }
    }
  }

  return dp[m][n];
}
```

**Complexity:**
- Time: **O(m * n)**
- Space: **O(m * n)**

---

## Key Insight

The `*` operator is the tricky part. When we see `x*`:
1. **Zero occurrences**: skip both `x` and `*`, check `dp[i][j-2]`
2. **One or more occurrences**: if current char matches `x` (or `x` is `.`), check `dp[i-1][j]` (consume one char from s, keep the `x*` pattern available for more matches)

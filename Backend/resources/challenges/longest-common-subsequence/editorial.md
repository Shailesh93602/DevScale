# Editorial — Longest Common Subsequence

## Problem Summary

Find the length of the longest subsequence common to both strings. This is the classic LCS problem.

---

## Approach 1 — Recursion (Brute Force)

Compare characters from the end. If they match, both are part of the LCS. Otherwise, try skipping one character from each string.

```typescript
function longestCommonSubsequence(text1: string, text2: string): number {
  function lcs(i: number, j: number): number {
    if (i < 0 || j < 0) return 0;
    if (text1[i] === text2[j]) return 1 + lcs(i - 1, j - 1);
    return Math.max(lcs(i - 1, j), lcs(i, j - 1));
  }
  return lcs(text1.length - 1, text2.length - 1);
}
```

**Complexity:**
- Time: **O(2^(m+n))** — Exponential.
- Space: **O(m + n)** — Recursion stack.

---

## Approach 2 — 2D DP (Optimal) ✅

Build a table where `dp[i][j]` = LCS of `text1[0..i-1]` and `text2[0..j-1]`.

```typescript
function longestCommonSubsequence(text1: string, text2: string): number {
  const m = text1.length, n = text2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
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

## Approach 3 — Space-Optimized DP

Since each row only depends on the previous row, we can use two 1D arrays.

```typescript
function longestCommonSubsequence(text1: string, text2: string): number {
  const m = text1.length, n = text2.length;
  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
    curr.fill(0);
  }

  return prev[n];
}
```

**Complexity:**
- Time: **O(m * n)**
- Space: **O(min(m, n))**

---

## Key Insight

The LCS problem has optimal substructure: if the last characters match, they are part of the LCS; otherwise, we try both options (skip from text1 or text2) and take the max. This naturally leads to a 2D DP table.

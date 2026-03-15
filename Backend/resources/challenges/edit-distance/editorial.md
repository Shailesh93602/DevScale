# Editorial — Edit Distance

## Problem Summary

Find the minimum number of insert, delete, and replace operations to transform one string into another. Also known as Levenshtein distance.

---

## Approach 1 — 2D DP (Optimal) ✅

Define `dp[i][j]` = min edits to convert `word1[0..i-1]` to `word2[0..j-1]`.

```typescript
function minDistance(word1: string, word2: string): number {
  const m = word1.length, n = word2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  // Base cases: converting to/from empty string
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // Characters match, no operation needed
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // Delete from word1
          dp[i][j - 1],     // Insert into word1
          dp[i - 1][j - 1]  // Replace in word1
        );
      }
    }
  }

  return dp[m][n];
}
```

**Complexity:**
- Time: **O(m * n)**
- Space: **O(m * n)** (can be optimized to O(n))

---

## Approach 2 — Space-Optimized DP

Use two 1D arrays since each row depends only on the previous row.

```typescript
function minDistance(word1: string, word2: string): number {
  const m = word1.length, n = word2.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n];
}
```

**Complexity:**
- Time: **O(m * n)**
- Space: **O(n)**

---

## Key Insight

At each pair of characters (i, j), if they match, no operation is needed. If they don't match, we take the minimum of three operations:
- Delete: solve for `(i-1, j)` and delete `word1[i]`
- Insert: solve for `(i, j-1)` and insert `word2[j]`
- Replace: solve for `(i-1, j-1)` and replace `word1[i]` with `word2[j]`

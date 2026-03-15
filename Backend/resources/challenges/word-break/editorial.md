# Editorial — Word Break

## Problem Summary

Determine if a string can be broken into valid dictionary words. Words can be reused.

---

## Approach 1 — Recursion with Backtracking (Brute Force)

Try every possible prefix. If it's in the dictionary, recursively check the rest.

```typescript
function wordBreak(s: string, wordDict: string[]): boolean {
  const wordSet = new Set(wordDict);
  function canBreak(start: number): boolean {
    if (start === s.length) return true;
    for (let end = start + 1; end <= s.length; end++) {
      if (wordSet.has(s.substring(start, end)) && canBreak(end)) {
        return true;
      }
    }
    return false;
  }
  return canBreak(0);
}
```

**Complexity:**
- Time: **O(2^n)** — Exponential in the worst case.
- Space: **O(n)** — Recursion stack.

---

## Approach 2 — Bottom-Up DP (Optimal) ✅

Define `dp[i]` = true if `s[0..i-1]` can be segmented. For each position `i`, check all possible last words ending at `i`.

```typescript
function wordBreak(s: string, wordDict: string[]): boolean {
  const wordSet = new Set(wordDict);
  const n = s.length;
  const dp: boolean[] = new Array(n + 1).fill(false);
  dp[0] = true;

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
```

**Complexity:**
- Time: **O(n^2 * k)** where k is the average word length (for substring comparison).
- Space: **O(n + m)** where m is the total characters in wordDict.

---

## Key Insight

The DP approach checks: "Can I form `s[0..i-1]`?" by looking for a split point `j` where `s[0..j-1]` is valid (dp[j] = true) AND `s[j..i-1]` is a dictionary word. Using a HashSet for O(1) word lookups is essential.

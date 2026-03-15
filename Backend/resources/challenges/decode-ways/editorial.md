# Editorial — Decode Ways

## Problem Summary

Given a digit string, count the number of ways to decode it into letters (A=1, B=2, ..., Z=26).

---

## Approach 1 — Recursion with Memoization

At each position, try taking 1 digit or 2 digits if they form a valid mapping.

```typescript
function numDecodings(s: string): number {
  const memo = new Map<number, number>();

  function decode(i: number): number {
    if (i === s.length) return 1;
    if (s[i] === '0') return 0;
    if (memo.has(i)) return memo.get(i)!;

    let ways = decode(i + 1);
    if (i + 1 < s.length && parseInt(s.substring(i, i + 2)) <= 26) {
      ways += decode(i + 2);
    }
    memo.set(i, ways);
    return ways;
  }

  return decode(0);
}
```

**Complexity:**
- Time: **O(n)**
- Space: **O(n)**

---

## Approach 2 — Bottom-Up DP with O(1) Space (Optimal) ✅

Similar to Fibonacci, but with conditions for valid 1-digit and 2-digit decodings.

```typescript
function numDecodings(s: string): number {
  if (s[0] === '0') return 0;
  const n = s.length;
  let prev2 = 1; // dp[i-2], ways to decode empty prefix
  let prev1 = 1; // dp[i-1], ways to decode first character

  for (let i = 1; i < n; i++) {
    let current = 0;
    // Single digit: s[i] is '1'-'9'
    if (s[i] !== '0') {
      current += prev1;
    }
    // Two digits: s[i-1..i] is '10'-'26'
    const twoDigit = parseInt(s.substring(i - 1, i + 1));
    if (twoDigit >= 10 && twoDigit <= 26) {
      current += prev2;
    }
    prev2 = prev1;
    prev1 = current;
  }

  return prev1;
}
```

**Complexity:**
- Time: **O(n)**
- Space: **O(1)**

---

## Key Insight

This is a Fibonacci-like problem with additional constraints. At each position `i`, we check: (1) can `s[i]` stand alone as a valid letter? (2) can `s[i-1..i]` form a valid two-digit letter (10-26)? The tricky part is handling zeros correctly -- '0' alone is invalid, but '10' and '20' are valid.

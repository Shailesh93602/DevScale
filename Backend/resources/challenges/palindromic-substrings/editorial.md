# Editorial — Palindromic Substrings

## Approach 1: Expand Around Center (Optimal)
A palindrome mirrors around its center.

There are exactly `2n - 1` centers for a string of length `n`:
- `n` characters (e.g., 'a', 'b', 'c' acting as centers for odd-length palindromes)
- `n - 1` gaps between characters (acting as centers for even-length palindromes)

We can systematically try to expand out from every possible center. For every step we expand and the characters match, we have found a valid palindrome.

```typescript
function countSubstrings(s: string): number {
  let count = 0;

  // Helper to expand around a center and count palindromes
  const countPalindromesAroundCenter = (left: number, right: number) => {
    let localCount = 0;
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      localCount++;
      left--;
      right++;
    }
    return localCount;
  };

  for (let i = 0; i < s.length; i++) {
    // Odd length palindromes (single char center)
    count += countPalindromesAroundCenter(i, i);
    
    // Even length palindromes (center is between i and i+1)
    count += countPalindromesAroundCenter(i, i + 1);
  }

  return count;
}
```

**Complexity:**
- **Time Complexity:** **O(n²)**, since expanding from a center can take up to $O(n)$ time, and there are $2n - 1$ centers.
- **Space Complexity:** **O(1)**, since we only allocate a few pointer variables.

---

## Approach 2: DP (Alternative approach)
We can solve this using DP where `dp[i][j]` is true if substring `s[i...j]` is a palindrome.
`dp[i][j] = (s[i] == s[j]) and dp[i+1][j-1]`

This is also $O(n^2)$ time but uses $O(n^2)$ space, making the Expand Around Center method practically better.

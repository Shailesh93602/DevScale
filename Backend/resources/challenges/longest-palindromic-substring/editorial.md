# Editorial — Longest Palindromic Substring

## Approach 1: Expand Around Center (O(n²) Time, O(1) Space)

The easiest and most optimal way to approach this without complex data structures is to observe that every palindrome has a "center".
A center can be:
- A single character (like the 'b' in "aba")
- The space between two characters (like the center of "abba")

For a string of length $n$, there are $2n - 1$ such centers.
We can simply iterate through all these centers, expand outwards as long as the characters match, and keep track of the longest palindrome we've found.

```typescript
function longestPalindrome(s: string): string {
  if (s.length < 2) return s;

  let start = 0;
  let maxLen = 0;

  const expandAroundCenter = (left: number, right: number) => {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      const currentLen = right - left + 1;
      if (currentLen > maxLen) {
        maxLen = currentLen;
        start = left;
      }
      left--;
      right++;
    }
  };

  for (let i = 0; i < s.length; i++) {
    // Check for odd length palindrome
    expandAroundCenter(i, i);
    
    // Check for even length palindrome
    expandAroundCenter(i, i + 1);
  }

  return s.substring(start, start + maxLen);
}
```

**Complexity:**
- Time: **O(n²)**, since expanding a palindrome around its center could take $O(n)$ time, and we do this for $2n - 1$ centers.
- Space: **O(1)**, as we are only using a few pointers to track the start and length.

---

## Alternative Approaches

### Dynamic Programming (O(n²) Time, O(n²) Space)
You can maintain a 2D boolean array `dp[i][j]` which is true if `s[i...j]` is a palindrome.
`dp[i][j] = (s[i] == s[j]) && dp[i+1][j-1]`
While it has the same time complexity $O(n^2)$, it consumes $O(n^2)$ space, making it less optimal than expanding around the center.

### Manacher's Algorithm (O(n) Time)
There is a complex linear time algorithm called Manacher's algorithm. However, it is rarely expected in standard interviews due to its niche nature, and the Expand Around Center approach is generally the expected optimal solution.

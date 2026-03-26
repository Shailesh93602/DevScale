# Editorial — Wildcard Matching

### Approach: Dynamic Programming
This problem can be solved using a 2D dynamic programming table. Let `dp[i][j]` be a boolean indicating whether the substring `s[0...i-1]` matches the pattern `p[0...j-1]`.

1. **Base Case**: 
   - `dp[0][0] = true` (empty string matches empty pattern).
   - If the pattern has `*` at the beginning, it can match an empty string, so `dp[0][j] = dp[0][j-1]` if `p[j-1] == '*'`.

2. **Transitions**:
   - If `p[j-1] == '?'` or `s[i-1] == p[j-1]`:
     `dp[i][j] = dp[i-1][j-1]` (match the current character and look at the previous match).
   - If `p[j-1] == '*'`:
     `dp[i][j] = dp[i-1][j] || dp[i][j-1]`
     - `dp[i][j-1]` means `*` matches **zero** characters.
     - `dp[i-1][j]` means `*` matches **one or more** characters.

**Complexity**
- Time: $O(N \times M)$ where $N$ and $M$ are lengths of string and pattern respectively.
- Space: $O(N \times M)$ to store the DP table. (Can be optimized to $O(M)$).

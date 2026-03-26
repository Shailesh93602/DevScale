# Editorial — Palindrome Partitioning

### Approach: Backtracking
This problem asks for all possible ways to partition a string into palindromic substrings. This type of exhaustive search is a classic case for backtracking.

**Algorithm**
1. Define a recursive function `backtrack(startIdx, currentPartition)`:
   - **Base Case**: If `startIdx` equals the length of `s`, we've successfully partitioned the entire string. Add a copy of `currentPartition` to our result list.
   - **Recursive Step**: Iterate through all possible end indices `i` for a substring starting at `startIdx`.
     - Check if `s.substring(startIdx, i + 1)` is a palindrome.
     - If yes, append it to `currentPartition` and call `backtrack(i + 1, currentPartition)`.
     - Remove the substring from `currentPartition` (backtrack).

**Optimization**
We can use Dynamic Programming to pre-calculate whether a substring `s[i...j]` is a palindrome. This avoids redundant checks during backtracking.

**Complexity**
- Time: $O(N \cdot 2^N)$ in the worst case (e.g., a string of all 'a's). There are $2^N$ possible ways to partition a string, and we check each for validity.
- Space: $O(N)$ for the recursion stack depth.

# Editorial — Longest Valid Parentheses

### Approach 1: Using a Stack
We can use a stack to keep track of the indices of the parentheses.

1. Initialize a stack and push `-1` onto it (this acts as a boundary for the first valid substring).
2. For each character in the string:
   - If it's a `'('`, push its index onto the stack.
   - If it's a `')'`:
     - Pop the top element from the stack.
     - If the stack is now empty, push the current index (this becomes the new boundary for future valid substrings).
     - If the stack is not empty, calculate the length of the current valid substring: `currentIndex - stack[topIndex]` and update the maximum length.

**Complexity**
- Time: $O(N)$ where $N$ is the length of the string.
- Space: $O(N)$ for the stack.

### Approach 2: Dynamic Programming
Let `dp[i]` be the length of the longest valid parentheses substring ending at index `i`.
- If `s[i] == '('`, `dp[i] = 0`.
- If `s[i] == ')'`:
  - If `s[i-1] == '('`, then `dp[i] = dp[i-2] + 2`.
  - If `s[i-1] == ')'` and `s[i - dp[i-1] - 1] == '('`, then `dp[i] = dp[i-1] + dp[i - dp[i-1] - 2] + 2`.

**Complexity**
- Time: $O(N)$.
- Space: $O(N)$.

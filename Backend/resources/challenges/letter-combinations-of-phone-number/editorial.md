# Editorial — Letter Combinations of a Phone Number

### Approach: Backtracking (DFS)
This is a generative problem where we need to find all possible combinations. Backtracking is the perfect fit.

1. Create a mapping of each digit to its corresponding letters.
2. Define a recursive function `backtrack(index, currentCombination)`:
   - **Base Case**: If `index` is equal to the length of `digits`, the `currentCombination` is complete. Add it to the result list.
   - **Recursive Step**: 
     - Get the letters that map to `digits[index]`.
     - For each of these letters, call the backtrack function for `index + 1` with the letter appended to `currentCombination`.

**Complexity**
- Time: $O(3^N \times 4^M)$ where $N$ is the number of digits that map to 3 letters (e.g., 2, 3, 4, 5, 6, 8) and $M$ is the number of digits that map to 4 letters (7, 9). This is because for each digit, we have 3 or 4 choices.
- Space: $O(N+M)$ for the recursive stack.

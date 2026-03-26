# Editorial — Word Search

### Approach: Backtracking (DFS)
The problem asks us to find a path in a grid that forms a specific word. Since we need to explore all possible paths starting from all possible starting points, backtracking is the natural choice.

**Algorithm**
1. Iterate over every cell $(r, c)$ in the board.
2. If `board[r][c]` equals the first character of the word, trigger a recursive DFS (`backtrack`) from that cell.
3. In `backtrack(r, c, index)`:
   - **Base Case**: If `index == word.length`, we found the word. Return `true`.
   - **Boundary Condition**: If $(r, c)$ is out of bounds or `board[r][c]` does not match `word[index]`, return `false`.
   - **Mark Visited**: Temporarily save `board[r][c]` and replace it with a marker like `'#'` to avoid reusing the cell in the same path.
   - **Explore**: Recursively call `backtrack` for the 4 adjacent cells (Up, Down, Left, Right).
   - **Restore**: After exploration, restore `board[r][c]` to its original value. This is the "backtracking" step.

**Complexity**
- Time: $O(N \cdot 3^L)$ where $N$ is the number of cells in the board and $L$ is the length of the word. For each cell, we explore 3 directions (excluding the one we came from).
- Space: $O(L)$ for the recursion depth.

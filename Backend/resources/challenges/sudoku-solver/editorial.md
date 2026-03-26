# Editorial — Sudoku Solver

### Approach: Backtracking
Sudoku Solver is a classic constraint satisfaction problem that can be solved efficiently using backtracking. 

1. **State Space Search**: We iterate through each cell. If it's empty, we try all numbers from 1 to 9.
2. **Validity Check**: For each number, we check if it already exists in the current row, column, or the 3x3 sub-grid.
3. **Recursive Step**: If placing a number is valid, we move to the next empty cell.
4. **Backtrack**: If we reach a state where no number can be placed in an empty cell, we undo the last placement and try the next possibility.

**Optimization: Pre-calculation**
Instead of iterating 27 cells (row, col, box) every time to check validity, we can maintain sets or bitmasks for:
- 9 rows
- 9 columns
- 9 blocks (3x3 boxes)

This reduces the validity check to $O(1)$.

**Complexity**
- Time: $O(9^{81})$ in the absolute worst case, but significantly lower due to Sudoku constraints.
- Space: $O(81)$ for the recursion stack.

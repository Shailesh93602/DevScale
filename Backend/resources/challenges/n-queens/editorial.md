# Editorial — N-Queens

### Approach: Backtracking
We can place one queen in each row. For each row, we try to place a queen in every column and check if it's "safe".

**Safety Check**
A queen is safe if:
1. No other queen is in the same column.
2. No other queen is on the same "negative" diagonal ($r - c = \text{const}$).
3. No other queen is on the same "positive" diagonal ($r + c = \text{const}$).

We can use three sets to keep track of columns and diagonals that are already occupied by queens.

**Algorithm**
1. Initialize `cols`, `diagonals1` ($r-c$), and `diagonals2` ($r+c$) as empty sets.
2. Define `backtrack(row)`:
   - If `row == n`, we found a solution. Add the board state to results.
   - For each `col` from `0` to `n-1`:
     - If `col`, `row-col`, or `row+col` is in our sets, skip.
     - Place queen, add to sets.
     - `backtrack(row + 1)`.
     - Remove queen, remove from sets (backtrack).

**Complexity**
- Time: $O(N!)$ because we have $N$ choices for the first row, $N-1$ for the second, and so on.
- Space: $O(N^2)$ to store the board, or $O(N)$ if only storing positions.

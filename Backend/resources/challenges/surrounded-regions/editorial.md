# Editorial — Surrounded Regions

## Approach: DFS/BFS from the Border (O(M×N) Time, O(M×N) Space)

The problem asks us to flip any regions of `'O'`s that are entirely surrounded by `'X'`s.

The key observation is: **Any `'O'` that is connected to the border of the board CANNOT be surrounded.**

Thus, instead of looking for surrounded regions, it is simpler to:
1. Identify all `'O'`s on the four borders of the grid.
2. Starting from those border `'O'`s, perform a DFS/BFS to find all `'O'`s connected to them. Mark these as `'S'` (Safe/Survives).
3. Now, iterate through the whole grid:
   - Any remaining `'O'` must be fully surrounded, so we flip it to `'X'`.
   - Any `'S'` was connected to the border, so we flip it back to `'O'`.

### Algorithm

```typescript
function solve(board: string[][]): void {
  const m = board.length, n = board[0].length;
  // Step 1: DFS from all borders 'O'
  function dfs(r, c) {
    if (r < 0 || r >= m || c < 0 || c >= n || board[r][c] !== 'O') return;
    board[r][c] = 'S'; // Safe
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) dfs(r + dr, c + dc);
  }

  for (let r = 0; r < m; r++) {
    if (board[r][0] === 'O') dfs(r, 0);
    if (board[r][n - 1] === 'O') dfs(r, n - 1);
  }
  for (let c = 0; c < n; c++) {
    if (board[0][c] === 'O') dfs(0, c);
    if (board[m - 1][c] === 'O') dfs(m - 1, c);
  }

  // Step 2 & 3: Flip 'S'->'O', 'O'->'X'
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (board[r][c] === 'O') board[r][c] = 'X';
      else if (board[r][c] === 'S') board[r][c] = 'O';
    }
  }
}
```

**Complexity:**
- **Time/Space:** **O(M×N)** since every cell is visited and processed at most a constant number of times. Space is constrained to the BFS queue or DFS call stack.

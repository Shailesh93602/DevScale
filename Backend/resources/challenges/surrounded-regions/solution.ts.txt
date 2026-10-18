// O(M*N) Time, O(M*N) Space — DFS from borders
function solve(board: string[][]): void {
  const m = board.length;
  if (m === 0) return;
  const n = board[0].length;

  function dfs(r: number, c: number): void {
    if (r < 0 || r >= m || c < 0 || c >= n || board[r][c] !== 'O') return;

    board[r][c] = 'S'; // Mark as 'S' (safe)
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  // 1. Mark 'O's connected to border as 'S'
  for (let r = 0; r < m; r++) {
    if (board[r][0] === 'O') dfs(r, 0);
    if (board[r][n - 1] === 'O') dfs(r, n - 1);
  }

  for (let c = 0; c < n; c++) {
    if (board[0][c] === 'O') dfs(0, c);
    if (board[m - 1][c] === 'O') dfs(m - 1, c);
  }

  // 2. Flip all remaining 'O's to 'X', and 'S's back to 'O'
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (board[r][c] === 'O') {
        board[r][c] = 'X';
      } else if (board[r][c] === 'S') {
        board[r][c] = 'O';
      }
    }
  }
}

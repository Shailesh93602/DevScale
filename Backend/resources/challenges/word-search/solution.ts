function exist(board: string[][], word: string): boolean {
  const m = board.length;
  const n = board[0].length;

  function backtrack(r: number, c: number, index: number): boolean {
    if (index === word.length) return true;
    if (r < 0 || r >= m || c < 0 || c >= n || board[r][c] !== word[index]) {
      return false;
    }

    const temp = board[r][c];
    board[r][c] = '#'; // Mark as visited

    const found = 
      backtrack(r + 1, c, index + 1) ||
      backtrack(r - 1, c, index + 1) ||
      backtrack(r, c + 1, index + 1) ||
      backtrack(r, c - 1, index + 1);

    board[r][c] = temp; // Restore (backtrack)
    return found;
  }

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (backtrack(r, c, 0)) return true;
    }
  }

  return false;
}

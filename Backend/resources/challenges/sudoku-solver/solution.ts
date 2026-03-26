function solveSudoku(board: string[][]): void {
  const rows = Array.from({ length: 9 }, () => new Set<string>());
  const cols = Array.from({ length: 9 }, () => new Set<string>());
  const boxes = Array.from({ length: 9 }, () => new Set<string>());

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val !== '.') {
        rows[r].add(val);
        cols[c].add(val);
        const boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        boxes[boxIdx].add(val);
      }
    }
  }

  function backtrack(r: number, c: number): boolean {
    if (r === 9) return true;
    if (c === 9) return backtrack(r + 1, 0);
    if (board[r][c] !== '.') return backtrack(r, c + 1);

    const boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    for (let val = 1; val <= 9; val++) {
      const char = val.toString();
      if (!rows[r].has(char) && !cols[c].has(char) && !boxes[boxIdx].has(char)) {
        board[r][c] = char;
        rows[r].add(char);
        cols[c].add(char);
        boxes[boxIdx].add(char);

        if (backtrack(r, c + 1)) return true;

        board[r][c] = '.';
        rows[r].delete(char);
        cols[c].delete(char);
        boxes[boxIdx].delete(char);
      }
    }

    return false;
  }

  backtrack(0, 0);
}

// O(n) Time, O(n) Space — Simulating row append
function convert(s: string, numRows: number): string {
  if (numRows === 1 || s.length <= numRows) return s;

  const rows: string[] = new Array(numRows).fill('');
  
  let currentRow = 0;
  let goingDown = false;

  for (const char of s) {
    rows[currentRow] += char;
    
    // Change direction if we hit the top or bottom
    if (currentRow === 0 || currentRow === numRows - 1) {
      goingDown = !goingDown;
    }
    
    currentRow += goingDown ? 1 : -1;
  }

  return rows.join('');
}

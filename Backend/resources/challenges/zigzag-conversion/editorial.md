# Editorial — Zigzag Conversion

## Approach: Simulate Row Append (O(n) Time, O(n) Space)

The problem asks us to traverse a string and write its characters out in a "zigzag" pattern across `numRows`, then read the characters horizontally row by row.

Instead of actually building a 2D matrix (which wastes a lot of space tracking empty gaps), we can just maintain an array of strings, where each string represents a row.

We start at row `0`. As we iterate through the characters of our string, we append the character to the string of our current row.
Then, we move the row tracker.
- If we are moving down, `row += 1`
- If we are moving up, `row -= 1`

Whenever we hit the top (`row === 0`) or the bottom (`row === numRows - 1`), we flip our direction!

```typescript
function convert(s: string, numRows: number): string {
  // Edge case: if only 1 row or string length is smaller than numRows
  if (numRows === 1 || s.length <= numRows) return s;

  // Create an array of strings for each row
  const rows: string[] = new Array(numRows).fill('');
  
  let currentRow = 0;
  let goingDown = false;

  for (const char of s) {
    // Append the character to the current row
    rows[currentRow] += char;
    
    // Change direction if we hit the top or bottom
    if (currentRow === 0 || currentRow === numRows - 1) {
      goingDown = !goingDown;
    }
    
    // Move up or down based on direction
    currentRow += goingDown ? 1 : -1;
  }

  // Concatenate all rows
  return rows.join('');
}
```

**Complexity:**
- **Time Complexity:** **O(n)** where `n == s.length`. We do exactly one pass over the string.
- **Space Complexity:** **O(n)**. The `rows` array of strings will collectively store exactly `n` characters.

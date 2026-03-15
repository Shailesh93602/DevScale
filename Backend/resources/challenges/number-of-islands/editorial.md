# Editorial — Number of Islands

## Approach: DFS Flood Fill (O(M×N) Time, O(M×N) Space)

Iterate through every cell. When we find an unvisited `'1'`, it's the start of a new island — we increment the count and run a DFS to "sink" all connected land by marking cells as `'0'` (visited). This way each cell is processed at most once.

```typescript
function numIslands(grid: string[][]): number {
  const rows = grid.length, cols = grid[0].length;
  let count = 0;

  function dfs(r: number, c: number): void {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0'; // Sink/visit this land
    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (grid[r][c] === '1') { count++; dfs(r, c); }

  return count;
}
```

**Complexity:**
- **Time:** **O(M×N)** — each cell is visited at most twice.
- **Space:** **O(M×N)** — worst-case call stack for a fully land grid.

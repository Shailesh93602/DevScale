# Editorial — Pacific Atlantic Water Flow

## Approach: Reverse BFS from Ocean Borders (O(M×N) Time, O(M×N) Space)

Instead of asking which cells can flow TO the ocean, we reverse the problem: which cells can be reached FROM the ocean going **uphill** (height ≥)?

1. Run BFS/DFS from all **Pacific border** cells (top row + left column), expanding to neighbors with height ≥ current. Mark in `pacific[][]`.
2. Run BFS/DFS from all **Atlantic border** cells (bottom row + right column). Mark in `atlantic[][]`.
3. The answer is every cell marked `true` in **both** matrices.

```typescript
function pacificAtlantic(heights: number[][]): number[][] {
  const rows = heights.length, cols = heights[0].length;
  // ... setup and BFS ...
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (pacific[r][c] && atlantic[r][c]) result.push([r, c]);
  return result;
}
```

**Complexity:**
- **Time:** **O(M×N)** — each cell added to BFS at most twice.
- **Space:** **O(M×N)** for visited matrices.

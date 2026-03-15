# Editorial — Rotting Oranges

## Approach: Multi-Source BFS (O(M×N) Time, O(M×N) Space)

Classic multi-source BFS. The key insight: all initially rotten oranges start spreading simultaneously. So we start by adding ALL rotten oranges to the BFS queue at the same time.

Each BFS "level" represents one minute passing. We count how many levels elapse until no more fresh oranges exist.

```typescript
function orangesRotting(grid: number[][]): number {
  const queue: [number, number][] = [];
  let fresh = 0;

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }

  if (fresh === 0) return 0;
  let minutes = 0;

  while (queue.length && fresh > 0) {
    const size = queue.length;
    minutes++;
    for (let i = 0; i < size; i++) {
      const [r, c] = queue.shift()!;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (valid && grid[nr][nc] === 1) {
          grid[nr][nc] = 2; fresh--; queue.push([nr, nc]);
        }
      }
    }
  }

  return fresh === 0 ? minutes : -1;
}
```

**Complexity:**
- **Time:** **O(M×N)** — each cell processed at most once.
- **Space:** **O(M×N)** — BFS queue in worst case.

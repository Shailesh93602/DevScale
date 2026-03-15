# Editorial — Walls and Gates

## Approach: Multi-source BFS (O(M×N) Time, O(M×N) Space)

The problem asks for the **shortest distance** to any gate, making Breadth-First Search (BFS) the natural choice. 

Instead of starting a BFS from each empty room (which could be O(M^2 * N^2) in the worst case), we start the BFS from **all gates simultaneously** (Multi-source BFS). As the distance radiates outward from the gates (level 1, then level 2, etc.), the first time we reach an empty room, we are guaranteed that's the shortest distance to it. 

### Steps
1. Scan the whole grid and push the coordinates of all gates (`0`s) into a queue.
2. While the queue is not empty, pop a cell. For each of its 4 valid neighbors:
   - If the neighbor is not `INF` (it's either a wall, a gate, or an empty room we've already reached), skip it.
   - If it is `INF` (an unvisited empty room), set its value to `current_cell_distance + 1` and push it onto the queue.

```typescript
function wallsAndGates(rooms: number[][]): void {
  const m = rooms.length, n = rooms[0].length;
  const queue: [number, number][] = [];

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (rooms[r][c] === 0) queue.push([r, c]);
    }
  }

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length > 0) {
    const size = queue.length;
    for (let i = 0; i < size; i++) {
        const [r, c] = queue.shift()!;
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && rooms[nr][nc] === 2147483647) {
            rooms[nr][nc] = rooms[r][c] + 1;
            queue.push([nr, nc]);
            }
        }
    }
  }
}
```

**Complexity:**
- **Time/Space:** **O(M×N)** since each cell is added to the queue exactly once. Space is also bounded by the grid dimensions.

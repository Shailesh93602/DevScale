// O(M*N) Time, O(M*N) Space — Multi-source BFS
function wallsAndGates(rooms: number[][]): void {
  const m = rooms.length, n = rooms[0].length;
  const queue: [number, number][] = [];

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (rooms[r][c] === 0) queue.push([r, c]);
    }
  }

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let dist = 1;

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

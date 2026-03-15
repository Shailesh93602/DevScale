// O(M*N) Time, O(M*N) Space — Reverse BFS from both ocean borders
function pacificAtlantic(heights: number[][]): number[][] {
  const rows = heights.length, cols = heights[0].length;
  const pacific = Array.from({ length: rows }, () => new Array(cols).fill(false));
  const atlantic = Array.from({ length: rows }, () => new Array(cols).fill(false));
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

  function bfs(queue: [number, number][], visited: boolean[][]): void {
    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (visited[nr][nc]) continue;
        if (heights[nr][nc] < heights[r][c]) continue;
        visited[nr][nc] = true;
        queue.push([nr, nc]);
      }
    }
  }

  const pacQueue: [number, number][] = [];
  const atlQueue: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    pacific[r][0] = true; pacQueue.push([r, 0]);
    atlantic[r][cols-1] = true; atlQueue.push([r, cols-1]);
  }
  for (let c = 0; c < cols; c++) {
    pacific[0][c] = true; pacQueue.push([0, c]);
    atlantic[rows-1][c] = true; atlQueue.push([rows-1, c]);
  }

  bfs(pacQueue, pacific);
  bfs(atlQueue, atlantic);

  const result: number[][] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (pacific[r][c] && atlantic[r][c]) result.push([r, c]);

  return result;
}

class MinHeap<T> {
  private heap: T[] = [];
  constructor(private compare: (a: T, b: T) => number) {}
  push(val: T) {
    this.heap.push(val);
    this.bubbleUp();
  }
  pop(): T | undefined {
    if (this.size() === 0) return undefined;
    if (this.size() === 1) return this.heap.pop();
    const top = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown();
    return top;
  }
  size() { return this.heap.length; }
  private bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
        [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
        index = parentIndex;
      } else break;
    }
  }
  private bubbleDown() {
    let index = 0;
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let smallest = index;
      if (left < this.size() && this.compare(this.heap[left], this.heap[smallest]) < 0) smallest = left;
      if (right < this.size() && this.compare(this.heap[right], this.heap[smallest]) < 0) smallest = right;
      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else break;
    }
  }
}

function swimInWater(grid: number[][]): number {
  const n = grid.length;
  const visited = Array.from({ length: n }, () => new Array(n).fill(false));
  const minHeap = new MinHeap<[number, number, number]>((a, b) => a[0] - b[0]);

  minHeap.push([grid[0][0], 0, 0]);
  visited[0][0] = true;

  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  while (minHeap.size() > 0) {
    const [t, r, c] = minHeap.pop()!;
    if (r === n - 1 && c === n - 1) return t;

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && !visited[nr][nc]) {
        visited[nr][nc] = true;
        minHeap.push([Math.max(t, grid[nr][nc]), nr, nc]);
      }
    }
  }

  return -1;
}

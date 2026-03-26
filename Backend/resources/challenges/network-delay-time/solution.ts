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

function networkDelayTime(times: number[][], n: number, k: number): number {
  const adj: Map<number, [number, number][]> = new Map();
  for (const [u, v, w] of times) {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u)!.push([v, w]);
  }

  const dists = new Array(n + 1).fill(Infinity);
  dists[k] = 0;

  const minHeap = new MinHeap<[number, number]>((a, b) => a[0] - b[0]);
  minHeap.push([0, k]);

  while (minHeap.size() > 0) {
    const [d, u] = minHeap.pop()!;

    if (d > dists[u]) continue;

    const neighbors = adj.get(u);
    if (neighbors) {
      for (const [v, w] of neighbors) {
        if (dists[u] + w < dists[v]) {
          dists[v] = dists[u] + w;
          minHeap.push([dists[v], v]);
        }
      }
    }
  }

  let maxDist = 0;
  for (let i = 1; i <= n; i++) {
    if (dists[i] === Infinity) return -1;
    maxDist = Math.max(maxDist, dists[i]);
  }

  return maxDist;
}

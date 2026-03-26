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

function connectSticks(sticks: number[]): number {
  if (sticks.length <= 1) return 0;
  const minHeap = new MinHeap<number>((a, b) => a - b);
  for (const s of sticks) {
    minHeap.push(s);
  }

  let totalCost = 0;
  while (minHeap.size() > 1) {
    const s1 = minHeap.pop()!;
    const s2 = minHeap.pop()!;
    const combined = s1 + s2;
    totalCost += combined;
    minHeap.push(combined);
  }

  return totalCost;
}

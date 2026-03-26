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

function kSmallestPairs(nums1: number[], nums2: number[], k: number): number[][] {
  const result: number[][] = [];
  if (nums1.length === 0 || nums2.length === 0 || k === 0) return result;

  const minHeap = new MinHeap<[number, number, number]>((a, b) => a[0] - b[0]);

  for (let i = 0; i < Math.min(nums1.length, k); i++) {
    minHeap.push([nums1[i] + nums2[0], i, 0]);
  }

  while (k > 0 && minHeap.size() > 0) {
    const [sum, i, j] = minHeap.pop()!;
    result.push([nums1[i], nums2[j]]);
    k--;

    if (j + 1 < nums2.length) {
      minHeap.push([nums1[i] + nums2[j + 1], i, j + 1]);
    }
  }

  return result;
}

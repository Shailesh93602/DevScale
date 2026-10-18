class Heap {
  private data: number[];
  private compare: (a: number, b: number) => boolean;

  constructor(compare: (a: number, b: number) => boolean) {
    this.data = [];
    this.compare = compare;
  }

  size(): number { return this.data.length; }
  peek(): number { return this.data[0]; }

  push(val: number): void {
    this.data.push(val);
    let index = this.data.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.data[parent], this.data[index])) break;
      this.swap(index, parent);
      index = parent;
    }
  }

  pop(): number {
    if (this.data.length === 0) return 0;
    if (this.data.length === 1) return this.data.pop()!;
    const top = this.data[0];
    this.data[0] = this.data.pop()!;
    let index = 0;
    // Bubble down
    while (true) {
      const left = index * 2 + 1, right = index * 2 + 2;
      let next = index;
      if (left < this.data.length && this.compare(this.data[left], this.data[next])) next = left;
      if (right < this.data.length && this.compare(this.data[right], this.data[next])) next = right;
      if (next === index) break;
      this.swap(index, next);
      index = next;
    }
    return top;
  }

  private swap(i: number, j: number): void {
    const temp = this.data[i];
    this.data[i] = this.data[j];
    this.data[j] = temp;
  }
}

// O(log N) Add, O(1) Find Median — Two Heaps
export class MedianFinder {
  private leftMaxHeap: Heap;   // Max heap for lower half
  private rightMinHeap: Heap;  // Min heap for upper half

  constructor() {
    this.leftMaxHeap = new Heap((a, b) => a > b);
    this.rightMinHeap = new Heap((a, b) => a < b);
  }

  addNum(num: number): void {
    this.leftMaxHeap.push(num);
    const maxOfLeft = this.leftMaxHeap.pop(); // Re-balance logic
    this.rightMinHeap.push(maxOfLeft);

    // Ensure left half always has equal or +1 elements compared to right half
    if (this.leftMaxHeap.size() < this.rightMinHeap.size()) {
      const minOfRight = this.rightMinHeap.pop();
      this.leftMaxHeap.push(minOfRight);
    }
  }

  findMedian(): number {
    if (this.leftMaxHeap.size() > this.rightMinHeap.size()) {
      return this.leftMaxHeap.peek();
    }
    return (this.leftMaxHeap.peek() + this.rightMinHeap.peek()) / 2.0;
  }
}

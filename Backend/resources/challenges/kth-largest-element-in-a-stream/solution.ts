class MinHeap {
  private heap: number[] = [];
  
  constructor() {}
  
  size(): number { return this.heap.length; }
  
  peek(): number { return this.heap[0]; }
  
  push(val: number): void {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }
  
  pop(): number {
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0 && end !== undefined) {
      this.heap[0] = end;
      this.bubbleDown(0);
    }
    return min;
  }
  
  private bubbleUp(index: number): void {
    let curr = index;
    while (curr > 0) {
      const parentIdx = Math.floor((curr - 1) / 2);
      if (this.heap[curr] >= this.heap[parentIdx]) break;
      this.swap(curr, parentIdx);
      curr = parentIdx;
    }
  }
  
  private bubbleDown(index: number): void {
    let curr = index;
    const length = this.heap.length;
    
    while (true) {
      const leftChild = 2 * curr + 1;
      const rightChild = 2 * curr + 2;
      let minIdx = curr;
      
      if (leftChild < length && this.heap[leftChild] < this.heap[minIdx]) minIdx = leftChild;
      if (rightChild < length && this.heap[rightChild] < this.heap[minIdx]) minIdx = rightChild;
      
      if (minIdx === curr) break;
      this.swap(curr, minIdx);
      curr = minIdx;
    }
  }
  
  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}

export class KthLargest {
  private minHeap = new MinHeap();
  private k: number;

  constructor(k: number, nums: number[]) {
    this.k = k;
    for (const num of nums) {
      this.add(num);
    }
  }

  add(val: number): number {
    this.minHeap.push(val);
    if (this.minHeap.size() > this.k) {
      this.minHeap.pop();
    }
    return this.minHeap.peek();
  }
}

class MaxHeap {
  private heap: number[] = [];
  
  size(): number { return this.heap.length; }
  
  push(val: number): void {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }
  
  pop(): number {
    const max = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0 && end !== undefined) {
      this.heap[0] = end;
      this.bubbleDown(0);
    }
    return max;
  }
  
  private bubbleUp(index: number): void {
    let curr = index;
    while (curr > 0) {
      const parentIdx = Math.floor((curr - 1) / 2);
      if (this.heap[curr] <= this.heap[parentIdx]) break;
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
      let maxIdx = curr;
      
      if (leftChild < length && this.heap[leftChild] > this.heap[maxIdx]) maxIdx = leftChild;
      if (rightChild < length && this.heap[rightChild] > this.heap[maxIdx]) maxIdx = rightChild;
      
      if (maxIdx === curr) break;
      this.swap(curr, maxIdx);
      curr = maxIdx;
    }
  }
  
  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}

// O(N log N) Time, O(N) Space — Max-Heap Simulation
// Alternatively, since N is small (<= 30), O(N^2 log N) using repeated Array.sort() is perfectly acceptable.
export function lastStoneWeight(stones: number[]): number {
  const maxHeap = new MaxHeap();
  for (const stone of stones) {
    maxHeap.push(stone);
  }

  while (maxHeap.size() > 1) {
    const s1 = maxHeap.pop();
    const s2 = maxHeap.pop();

    if (s1 !== s2) {
      maxHeap.push(Math.abs(s1 - s2));
    }
  }

  return maxHeap.size() === 1 ? maxHeap.pop() : 0;
}

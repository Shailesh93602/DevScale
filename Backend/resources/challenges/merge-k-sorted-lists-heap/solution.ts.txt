class MinHeap {
  private heap: { val: number; rId: number; cId: number }[] = [];
  
  size(): number { return this.heap.length; }
  
  push(val: number, rId: number, cId: number): void {
    this.heap.push({ val, rId, cId });
    let curr = this.heap.length - 1;
    while (curr > 0) {
      const p = Math.floor((curr - 1) / 2);
      if (this.heap[p].val <= this.heap[curr].val) break;
      this.swap(p, curr);
      curr = p;
    }
  }
  
  pop(): { val: number; rId: number; cId: number } {
    const min = this.heap[0];
    const end = this.heap.pop() as { val: number; rId: number; cId: number };
    if (this.heap.length > 0) {
      this.heap[0] = end;
      let curr = 0;
      while (true) {
        const left = 2 * curr + 1;
        const right = 2 * curr + 2;
        let smallest = curr;
        if (left < this.heap.length && this.heap[left].val < this.heap[smallest].val) smallest = left;
        if (right < this.heap.length && this.heap[right].val < this.heap[smallest].val) smallest = right;
        if (smallest === curr) break;
        this.swap(curr, smallest);
        curr = smallest;
      }
    }
    return min;
  }
  
  private swap(i: number, j: number): void {
    const tmp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = tmp;
  }
}

// O(N log K) Time, O(K) Space — Merge K Sorted Lists pattern with Min Heap
export function mergeKArrays(arrays: number[][]): number[] {
  const heap = new MinHeap();

  for (let i = 0; i < arrays.length; i++) {
    if (arrays[i].length > 0) {
      heap.push(arrays[i][0], i, 0);
    }
  }

  const result: number[] = [];

  while (heap.size() > 0) {
    const { val, rId, cId } = heap.pop();
    result.push(val);

    if (cId + 1 < arrays[rId].length) {
      heap.push(arrays[rId][cId + 1], rId, cId + 1);
    }
  }

  return result;
}

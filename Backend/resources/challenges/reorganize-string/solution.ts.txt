class CharHeap {
  private heap: { char: string; count: number }[] = [];
  
  size(): number { return this.heap.length; }
  
  push(char: string, count: number): void {
    this.heap.push({ char, count });
    let curr = this.heap.length - 1;
    while (curr > 0) {
      const p = Math.floor((curr - 1) / 2);
      if (this.heap[p].count >= this.heap[curr].count) break;
      this.swap(p, curr);
      curr = p;
    }
  }
  
  pop(): { char: string; count: number } {
    const max = this.heap[0];
    const end = this.heap.pop() as { char: string; count: number };
    if (this.heap.length > 0) {
      this.heap[0] = end;
      let curr = 0;
      while (true) {
        const left = 2 * curr + 1;
        const right = 2 * curr + 2;
        let largest = curr;
        if (left < this.heap.length && this.heap[left].count > this.heap[largest].count) largest = left;
        if (right < this.heap.length && this.heap[right].count > this.heap[largest].count) largest = right;
        if (largest === curr) break;
        this.swap(curr, largest);
        curr = largest;
      }
    }
    return max;
  }
  
  private swap(i: number, j: number): void {
    const tmp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = tmp;
  }
}

// O(N log A) Time, O(A) Space — Max-Heap Simulation
export function reorganizeString(s: string): string {
  const counts = new Map<string, number>();
  for (const char of s) {
    counts.set(char, (counts.get(char) || 0) + 1);
  }

  const heap = new CharHeap();
  for (const [char, count] of counts.entries()) {
    heap.push(char, count);
  }

  let result = '';
  let prev: { char: string; count: number } | null = null;

  while (heap.size() > 0) {
    const current = heap.pop();
    result += current.char;

    // Wait until the *next* turn to push the 'prev' character 
    // to ensure NO two adjacent characters are identical.
    if (prev && prev.count > 0) {
      heap.push(prev.char, prev.count);
    }

    current.count -= 1;
    prev = current;
  }

  return result.length === s.length ? result : '';
}

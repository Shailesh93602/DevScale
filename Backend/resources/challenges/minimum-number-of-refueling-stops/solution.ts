class MaxHeap {
  private heap: number[] = [];
  
  size(): number { return this.heap.length; }
  
  push(val: number): void {
    this.heap.push(val);
    let curr = this.heap.length - 1;
    while (curr > 0) {
      const p = Math.floor((curr - 1) / 2);
      if (this.heap[p] >= this.heap[curr]) break;
      this.swap(p, curr);
      curr = p;
    }
  }
  
  pop(): number {
    const max = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0 && end !== undefined) {
      this.heap[0] = end;
      let curr = 0;
      while (true) {
        const left = 2 * curr + 1;
        const right = 2 * curr + 2;
        let largest = curr;
        if (left < this.heap.length && this.heap[left] > this.heap[largest]) largest = left;
        if (right < this.heap.length && this.heap[right] > this.heap[largest]) largest = right;
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

// O(N log N) Time, O(N) Space — Max-Heap Greedy
export function minRefuelStops(target: number, startFuel: number, stations: number[][]): number {
  const maxHeap = new MaxHeap();
  let currentFuel = startFuel;
  let currentPosition = 0;
  let stops = 0;
  let stationIndex = 0;

  while (currentFuel < target) {
    // Drive past all reachable stations
    while (stationIndex < stations.length && currentFuel >= stations[stationIndex][0]) {
      maxHeap.push(stations[stationIndex][1]);
      stationIndex++;
    }

    // Attempt to reach next destination or target by using fuel from past stations
    if (maxHeap.size() === 0) return -1;
    
    currentFuel += maxHeap.pop(); // Use largest fuel capacity seen so far
    stops++;
  }

  return stops;
}

# Editorial — Last Stone Weight

## Approach: Max-Heap Simulation (O(N log N) Time, O(N) Space)

The problem asks us to frequently pick the two heaviest stones and smash them, returning any remainder to the pile. This is exactly what a **Priority Queue (Max-Heap)** is designed to do efficiently.

While repeatedly doing `Array.prototype.sort()` takes `O(N^2 log N)` time and is acceptable due to the extremely small constraints constraint (`N <= 30`), an optimal `O(N log N)` solution involves a Max-Heap.

1. **Initialize:** Push all stones into a Max-Heap. In JavaScript/TypeScript, you need to implement a basic Max-Heap class, or you can use a Min-Heap trick where you push negative numbers.
2. **Smash Loop:** While the heap contains more than 1 item, pop the top two largest items (`maxHeap.pop()`).
3. If they are equal in weight, both are destroyed, do nothing.
4. If they differ in weight, push `Math.abs(s1 - s2)` back into the Max-Heap.
5. **Return:** When 1 or 0 elements remain, return the top element of the heap (or 0 if empty).

```typescript
function lastStoneWeight(stones: number[]): number {
  const maxHeap = new MaxHeap(); // Assume MaxHeap class implemented
  for (const s of stones) maxHeap.push(s);

  while (maxHeap.size() > 1) {
    const s1 = maxHeap.pop();
    const s2 = maxHeap.pop();

    if (s1 !== s2) maxHeap.push(Math.abs(s1 - s2));
  }

  return maxHeap.size() === 1 ? maxHeap.pop() : 0;
}
```

**Complexity:**
- **Time/Space:** **O(N log N)** time since building the heap takes `O(N log N)` and each smash extracts/inserts elements in `O(log N)` time. Space is **O(N)** for the heap storage.

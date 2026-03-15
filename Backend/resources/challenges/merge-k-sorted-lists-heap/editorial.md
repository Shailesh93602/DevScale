# Editorial — Merge K Sorted Arrays

## Approach: Min-Heap (O(N log K) Time, O(K) Space)

Merging `K` sorted arrays into one sorted array is a classic problem.

While concatenating all arrays and sorting the result takes `O(N log N)` where `N` is the total number of elements, we can do much better by taking advantage of the fact that each array is *already* sorted individually. 

We can use a **Min-Heap (Priority Queue)** to efficiently find the smallest element among all `K` arrays.

1. **Initialize Heap:** Insert the first element of each array into the Min-Heap.
2. **Track Origin:** Each element in the heap must know which array it came from and its index in that array so we can fetch the *next* element from the same array later. Formally, store tuples `(value, array_index, element_index)`.
3. **Merge Loop:** While the heap is not empty:
   - Extract the minimum element `val` from the heap and push it to the `result` array.
   - Look at the origin `array_index` and `element_index + 1`. If there is another element in that array, push it onto the Min-Heap.
   - Repeat until the heap is empty.

```typescript
function mergeKArrays(arrays: number[][]): number[] {
  const heap = new MinHeap(); // Assume MinHeap implemented

  for (let i = 0; i < arrays.length; i++) {
    if (arrays[i].length > 0) heap.push(arrays[i][0], i, 0);
  }

  const result = [];
  while (heap.size() > 0) {
    const { val, rId, cId } = heap.pop();
    result.push(val);

    if (cId + 1 < arrays[rId].length) {
      heap.push(arrays[rId][cId + 1], rId, cId + 1);
    }
  }

  return result;
}
```

**Complexity:**
- **Time:** **O(N log K)** — The heap size never exceeds `K` (the number of arrays). Every element (total `N`) is pushed and popped from the heap, each taking `O(log K)` time.
- **Space:** **O(K)** — The heap stores at most `K` elements at any time. The `result` array requires `O(N)` space.

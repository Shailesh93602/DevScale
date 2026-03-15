# Editorial — Kth Largest Element in a Stream

## Approach: Min-Heap (O(N log K + M log K) Time, O(K) Space)

The problem asks us to continuously track the **Kth largest element** in a growing list of numbers. 

A naive approach would be to append the new number and re-sort the list every time `add()` is called `O(N log N)`, which is too slow.

The optimal approach is to use a **Min-Heap (Priority Queue)** of size exactly `K`.
1. **Initialize:** Start by adding all initial numbers to the Min-Heap. If the heap size exceeds `K`, pop the smallest element. Since it's a Min-Heap, the smallest element is at the root. By popping elements whenever size > K, we discard the small numbers and the heap naturally retains only the **K largest elements** we've seen so far.
2. **Result Check:** Because there are exactly `K` elements in the Min-Heap, the smallest element (at the root) is exactly the **Kth largest element** overall. 
3. **Add Method:** When `add(val)` is called, push `val` into the heap. If the size exceeds `K`, pop the root. Then return the new root.

```typescript
class KthLargest {
  private minHeap = new MinHeap(); // Assume MinHeap is implemented
  private k: number;

  constructor(k: number, nums: number[]) {
    this.k = k;
    for (const num of nums) this.add(num);
  }

  add(val: number): number {
    this.minHeap.push(val);
    if (this.minHeap.size() > this.k) {
      this.minHeap.pop(); // Remove the smallest, leaving the K largest
    }
    return this.minHeap.peek(); // The Kth largest is at the root
  }
}
```

**Complexity:**
- **Time:** `O(N log K + M log K)` where `N` is initial array size, `M` is number of calls to `add()`. Pushing/popping from a heap of size `K` takes `O(log K)`.
- **Space:** `O(K)` for the Min-Heap.

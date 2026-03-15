# Editorial — Find Median from Data Stream

## Approach: Two Heaps (O(log N) Add, O(1) Median, Space O(N))

The problem requires a data structure that continuously supports adding numbers and returning the median of all numbers added so far. 

A sorted array gives `O(1)` median retrieval but takes `O(N)` time to insert a new number, leading to an overall `O(N^2)` time complexity. What we need is `O(log N)` insertions while roughly maintaining order.

Heaps perfectly provide this. If we divide the numbers into two halves:
1. `lowerHalf`: A Max-Heap storing the smaller half of numbers.
2. `upperHalf`: A Min-Heap storing the larger half of numbers.

With this setup:
- The median is found at the roots! If the two heaps are of equal size (meaning `total elements` is even), the median is `(lowerHalf.peek() + upperHalf.peek()) / 2.0`.
- If the heaps are unequal (meaning `total elements` is odd), we define a rule that `lowerHalf` always contains the extra element. The median is just `lowerHalf.peek()`.

### Maintaining Balance
When inserting a new number `num`:
1. We first push it into `lowerHalf` to let the Max-Heap place it correctly among the "small" elements.
2. But wait! What if `num` actually belongs to the upper half? To ensure elements in `lowerHalf` are truly strictly smaller than those in `upperHalf`, we always pop the maximum (root) of `lowerHalf` and push it to `upperHalf`. 
3. Now the largest of the "small" elements has successfully migrated. This guarantees all elements in `lowerHalf` `<= upperHalf`.
4. However, `lowerHalf` must always be equal or larger in size by exactly 1 compared to `upperHalf`. If `lowerHalf.size() < upperHalf.size()`, pop the minimum element from `upperHalf` and push it to `lowerHalf`.

```typescript
class MedianFinder {
  private lower: MaxHeap;
  private upper: MinHeap;

  constructor() {
    this.lower = new MaxHeap();
    this.upper = new MinHeap();
  }

  addNum(num: number): void {
    // Stage 1: Put it in lower
    this.lower.push(num);
    // Stage 2: Move the largest of lower to upper
    this.upper.push(this.lower.pop());
    
    // Stage 3: Rebalance sizes
    if (this.lower.size() < this.upper.size()) {
      this.lower.push(this.upper.pop());
    }
  }

  findMedian(): number {
    if (this.lower.size() > this.upper.size()) return this.lower.peek();
    return (this.lower.peek() + this.upper.peek()) / 2.0;
  }
}
```

**Complexity:**
- **Time:** `O(log N)` for `addNum` because we perform pushing/popping on heaps. `O(1)` for `findMedian` because we just view the roots.
- **Space:** `O(N)` to store `N` integers across the two heaps.

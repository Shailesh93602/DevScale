# Editorial — Kth Largest Element in an Array

## Approach: Quickselect (O(N) Average Time, O(1) Space)

The problem asks for the Kth largest element without sorting the array. While a Min-Heap of size K gives an `O(N log K)` time solution, **Quickselect** guarantees `O(N)` average-time complexity.

Quickselect uses the same partition strategy as Quicksort but discards the half of the sub-array that doesn't contain the target element. 

### Steps:
1. **Convert K to Index:** The Kth largest element is the same as the `(N - K)`th smallest element. Let `targetIndex = nums.length - K`. Our goal is to place the correct element exactly at `targetIndex`.
2. **Partition:** Choose a pivot (e.g., the last element `nums[right]`). Rearrange the array so that elements smaller than the pivot go to the left, and elements larger go to the right. Finally, place the pivot at its correct sorted position `p`.
3. **Compare & Recurse:**
   - If `p === targetIndex`, we found our element! Notice it doesn't matter if the rest of the array isn't sorted perfectly; `nums[p]` is in its correct place.
   - If `p < targetIndex`, we recursively quickselect the `[p + 1, right]` side.
   - If `p > targetIndex`, we recursively quickselect the `[left, p - 1]` side.

```typescript
function findKthLargest(nums: number[], k: number): number {
  const targetIndex = nums.length - k; 
  function partition(left, right) {
    const pivot = nums[right];
    let p = left;
    for (let i = left; i < right; i++) {
      if (nums[i] <= pivot) {
        swap(nums, i, p);
        p++;
      }
    }
    swap(nums, p, right);
    return p;
  }
  
  function quickSelect(left, right) {
    const p = partition(left, right);
    if (p === targetIndex) return nums[p];
    if (p < targetIndex) return quickSelect(p + 1, right);
    return quickSelect(left, p - 1);
  }
  
  return quickSelect(0, nums.length - 1);
}
```

**Complexity:**
- **Time:** **O(N)** average case because we discard roughly half the search space with every partition: `N + N/2 + N/4... = 2N = O(N)`. (Worst case is O(N^2) if array is already sorted and we pick the worst pivot, but we can randomize).
- **Space:** **O(1)** auxiliary space.

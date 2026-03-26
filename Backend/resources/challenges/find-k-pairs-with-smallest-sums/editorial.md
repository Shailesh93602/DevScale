# Editorial — Find K Pairs with Smallest Sums

### Approach: Min-Heap
Since both arrays are sorted, the pair with the absolute smallest sum is $(nums1[0], nums2[0])$. We can use a Min-Heap to find the next smallest pairs efficiently.

**Why not brute force?**
The total number of pairs is $N \times M$ (up to $10^{10}$), which is too large to sort. We only need the top $K$ ($K \le 10^4$).

**Algorithm**
1. Initialize a Min-Heap.
2. For each element in `nums1` (up to $K$), push a tuple `(nums1[i] + nums2[0], i, 0)` into the heap. Here $i$ and $0$ are indices in `nums1` and `nums2`.
3. Repeat $K$ times (or until heap is empty):
   - Pop the smallest element `(sum, i, j)` from the heap.
   - Add `[nums1[i], nums2[j]]` to the result list.
   - If $j + 1 < \text{length of } nums2$, push `(nums1[i] + nums2[j+1], i, j+1)` into the heap.

This approach works because if we've picked $(nums1[i], nums2[j])$, the next potential smallest pair involving $nums1[i]$ must be $(nums1[i], nums2[j+1])$.

**Complexity**
- Time: $O(\min(N, K) \cdot \log K + K \log K)$.
- Space: $O(K)$ to store the heap.

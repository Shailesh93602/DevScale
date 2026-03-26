# Editorial — Kth Smallest Element in a Sorted Matrix

### Approach 1: Min-Heap (K-Way Merge)
Since each row is sorted, we can treat the problem as finding the kth smallest element from $N$ sorted lists.

1. Push the first element of each row into a Min-Heap: `(val, row, col)`.
2. Extract the minimum element from the heap $k$ times.
3. Every time you extract `(val, r, c)`, push the next element from the same row `(matrix[r][c+1], r, c+1)`.
4. The $k$-th extraction is the answer.

**Complexity**
- Time: $O(K \log N)$.
- Space: $O(N)$ for the heap.

### Approach 2: Binary Search on Value Range
The range of possible values is `[matrix[0][0], matrix[n-1][n-1]]`.

1. Let `low = minVal`, `high = maxVal`.
2. While `low < high`:
   - `mid = (low + high) / 2`.
   - Count how many elements in the matrix are $\le mid$.
   - Since rows and columns are sorted, this count can be done in $O(N)$ by starting at the bottom-left corner and moving up or right.
   - If `count < k`, set `low = mid + 1`. Otherwise, `high = mid`.

**Complexity**
- Time: $O(N \log(\text{max} - \text{min}))$.
- Space: $O(1)$.

# Editorial — Range Minimum Query (Sparse Table)

### Why Sparse Table?
For the Range Minimum Query (RMQ) problem, there are several approaches:
1.  **Naive**: $O(1)$ update, $O(N)$ query.
2.  **Segment Tree**: $O(\log N)$ update, $O(\log N)$ query.
3.  **Sparse Table**: No updates allowed (static), but $O(1)$ query after $O(N \log N)$ preprocessing.

If the array is static and you have many queries, the Sparse Table is theoretically optimal.

### Core Idea: Power of Two Ranges
We precalculate the minimum for all ranges whose length is a power of two.
Let `st[j][i]` be the minimum value in the range starting at index `i` with length $2^j$.

1.  **Base Case**: `st[0][i] = nums[i]` (ranges of length $2^0 = 1$).
2.  **Recursive Step**: To find the minimum of a range of length $2^j$, we split it into two halves of length $2^{j-1}$:
    `st[j][i] = min(st[j-1][i], st[j-1][i + 2^(j-1)])`

### Answering Queries in O(1)
For an arbitrary range $[l, r]$, let its length be $len = r - l + 1$. 
We find the largest power of two $2^j$ such that $2^j \le len$. 

The range $[l, r]$ can be covered by two overlapping power-of-two ranges:
1.  One starting at $l$: `st[j][l]`
2.  One ending at $r$: `st[j][r - 2^j + 1]`

Since the `min` function is **idempotent** ($min(a, a) = a$), the overlap doesn't change the result. Thus:
`query(l, r) = min(st[j][l], st[j][r - 2^j + 1])`

**Note**: This $O(1)$ trick only works for idempotent functions like `min`, `max`, `gcd`. For sum queries, you would still need $O(\log N)$ to combine non-overlapping power-of-two ranges (or use a Prefix Sum array for $O(1)$).

### Complexity Analysis
- **Preprocessing**: $O(N \log N)$ to fill the $K \times N$ table.
- **Query**: $O(1)$ using the precomputed logs and two table lookups.
- **Space**: $O(N \log N)$ to store the table.

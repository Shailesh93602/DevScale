# Editorial — Segment Tree with Lazy Propagation

### Why a Segment Tree?
A simple array allows $O(1)$ point updates but $O(N)$ range sums. A prefix sum array allows $O(1)$ range sums but $O(N)$ updates. A **Segment Tree** provides a middle ground with $O(\log N)$ for both.

### Lazy Propagation
Standard Segment Trees handle point updates in $O(\log N)$. However, a range update (incrementing $N$ elements) would still be $O(N \log N)$ if done as $N$ point updates.

**Lazy Propagation** solves this by deferring updates:
1.  When updating a range $[L, R]$, if the current node covers a segment entirely within $[L, R]$, we update that node's value and store the pending increment in a `lazy` array for its children.
2.  We only "push" these pending updates down to the children when we actually visit them during a subsequent `update` or `query` call.
3.  This ensures that each range operation touches at most $O(\log N)$ nodes.

### Implementation Details
- **Tree Size**: The number of nodes in a segment tree for an array of size $N$ is at most $4N$.
- **Push Method**: The `push` function is critical. It updates the current node's sum based on the `lazy` value and propagates the `lazy` value to the children.
- **Merge Logic**: For range sums, the parent node's value is simply the sum of its two children: `tree[node] = tree[2*node] + tree[2*node+1]`.

### Complexity Analysis
- **Build Time**: $O(N)$.
- **Update Time**: $O(\log N)$.
- **Query Time**: $O(\log N)$.
- **Space Complexity**: $O(N)$ to store the `tree` and `lazy` arrays.


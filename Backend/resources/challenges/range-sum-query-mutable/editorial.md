# Editorial — Range Sum Query - Mutable

### Approach: Binary Indexed Tree (BIT)
When we need to handle frequent updates and range sum queries, a simple array or a prefix sum array is insufficient (one operation will always be $O(N)$).

A **Binary Indexed Tree** (also called a Fenwick Tree) provides $O(\log N)$ for both updating an element and calculating the prefix sum up to an index.

**Key Idea**
Each node in the BIT stores the sum of a range of elements. The range of elements a node manages is determined by the lowest set bit of its index.

1. **Update**: To update an element at index `i`, we calculate the difference (`val - old_val`) and add it to `tree[i]` and all its "successors" in the BIT by adding the least significant bit: `i += (i & -i)`.
2. **Sum Query**: To find the sum from `0` to `i`, we sum `tree[i]` and its "ancestors" by subtracting the least significant bit: `i -= (i & -i)`.
3. **Range Sum**: `sumRange(left, right)` is calculated as `query(right) - query(left - 1)`.

**Complexity**
- Time: $O(\log N)$ for both `update` and `sumRange`. $O(N \log N)$ for building the BIT (can be $O(N)$).
- Space: $O(N)$ to store the BIT and the original array.

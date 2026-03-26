# Segment Tree: Range Sum Query with Range Updates

A Segment Tree is a powerful data structure that allows for efficient range queries and range updates.

In this challenge, you will implement a Segment Tree that supports two operations on an array `nums`:
1.  **update(l, r, val)**: Increment all elements in the range `[l, r]` by `val`.
2.  **query(l, r)**: Return the sum of all elements in the range `[l, r]`.

To achieve $O(\log N)$ for both operations, you must use **Lazy Propagation**.

### Example 1:
**Input:** `nums = [1, 2, 3, 4, 5]`
1. `query(0, 2)` -> Returns `6` (1 + 2 + 3)
2. `update(1, 3, 2)` -> `nums` becomes `[1, 4, 5, 6, 5]`
3. `query(0, 2)` -> Returns `10` (1 + 4 + 5)

### Constraints:
- `1 <= nums.length <= 10^5`
- `0 <= l <= r < nums.length`
- Up to `10^5` calls to `update` and `query`.


# Range Minimum Query (Sparse Table)

Given an array of integers `nums`, your task is to answer multiple range minimum queries. Each query consists of two indices `l` and `r` (`l <= r`), and you must return the minimum value in the range `nums[l...r]`.

To achieve the best performance for a static array (no updates), you should implement a **Sparse Table**. A Sparse Table allows you to answer these queries in **O(1)** time after an **O(N log N)** preprocessing step.

### Example 1:
**Input:** `nums = [7, 2, 3, 0, 5, 10, 3, 12, 18]`
1. `query(0, 4)` -> Returns `0` (Min of [7, 2, 3, 0, 5])
2. `query(4, 7)` -> Returns `3` (Min of [5, 10, 3, 12])
3. `query(7, 8)` -> Returns `12` (Min of [12, 18])

### Constraints:
- `1 <= nums.length <= 10^5`
- `-10^9 <= nums[i] <= 10^9`
- `0 <= l <= r < nums.length`
- Up to `10^5` queries.

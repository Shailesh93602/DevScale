# Swim in Rising Water

You are given an `n x n` integer matrix `grid` where each value `grid[i][j]` represents the elevation at that point `(i, j)`.

The rain starts to fall. At time `t`, the depth of the water everywhere is `t`. You can swim from a square to another 4-directionally adjacent square if and only if both squares have an elevation at most `t`. You can swim infinite distances in zero time. Of course, you must stay within the boundaries of the grid during your swim.

You start at the top left square `(0, 0)`. What is the least time `t` until you can reach the bottom right square `(n - 1, n - 1)`?

### Example 1:
**Input:** `grid = [[0,2],[1,3]]`
**Output:** `3`
**Explanation:** 
At time 0, you are in grid[0][0] = 0.
You cannot go anywhere until time 2, when you can swim to grid[0][1] and grid[1][0].
At time 3, the entire grid is connected, and you can reach (1,1).

### Example 2:
**Input:** `grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]`
**Output:** `16`

### Constraints:
- `n == grid.length`
- `n == grid[i].length`
- `1 <= n <= 50`
- `0 <= grid[i][j] < n^2`
- Each value `grid[i][j]` is **unique**.

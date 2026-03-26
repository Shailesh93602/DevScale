# Editorial — Swim in Rising Water

### Approach 1: Dijkstra's Algorithm (Modified)
We need to find a path from the top-left to the bottom-right such that the maximum elevation along that path is minimized. This is a variation of the shortest path problem.

1. **Min-Priority Queue**: Store triplets `(max_elevation, row, col)`.
2. **Initial State**: Start with `(grid[0][0], 0, 0)` in the queue.
3. **Exploration**: At each step, pop the cell with the smallest `max_elevation`.
4. **Transition**: For each neighbor, the new `max_elevation` will be `max(current_max_elevation, neighbor_elevation)`.
5. **Goal**: The first time we pop the bottom-right cell `(n-1, n-1)`, the corresponding `max_elevation` is our answer.

**Complexity**
- Time: $O(N^2 \log N)$ where $N^2$ is the total number of cells.
- Space: $O(N^2)$ for the visited array and priority queue.

### Approach 2: Binary Search + DFS/BFS
The possible answers for `t` range from `0` to `n*n - 1`. If we can reach the end at time `T`, we can also reach it at any time `t > T`. This monotonicity allows us to use binary search.

1. **Binary Search Range**: `[0, n*n - 1]`.
2. **Checker Function**: For a given `t`, perform a DFS or BFS from `(0,0)` to see if we can reach `(n-1,n-1)` using only cells with elevation $\le t$.

**Complexity**
- Time: $O(N^2 \log(N^2))$ = $O(N^2 \log N)$.
- Space: $O(N^2)$.

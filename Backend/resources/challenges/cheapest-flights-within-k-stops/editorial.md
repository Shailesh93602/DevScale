# Editorial — Cheapest Flights Within K Stops

### Problem Analysis
This is a shortest-path problem on a weighted, directed graph. The special constraint is that we can use at most $K$ stops, which means the path can have at most $K+1$ edges.

### Approach 1: Breadth-First Search (BFS)
Standard BFS explores a graph level by level. In this context, each "level" corresponds to the number of stops taken.
1.  Initialize a `dists` array with `Infinity`.
2.  Start BFS from `src` with `stops = 0`.
3.  In each iteration, process all cities currently in the queue.
4.  For each city, attempt to "relax" the edges to its neighbors.
5.  Only add a neighbor to the queue if the new cost is better than the best cost found **in the previous levels**.
6.  Stop after $K+1$ levels.

### Approach 2: Bellman-Ford
The problem is perfectly suited for Bellman-Ford. We run $K+1$ relaxation steps. In each step, we update the minimum distance to reach each city using at most one more edge.

### Why not standard Dijkstra?
Standard Dijkstra finds the shortest path without considering the number of edges. A path with more edges but a lower total weight might be processed before a valid path with fewer edges. While Dijkstra can be modified to include the number of stops in the priority queue state, BFS/Bellman-Ford is often cleaner for this specific "bounded edge count" constraint.

### Complexity Analysis
- **Time Complexity**: $O(K \cdot E)$ where $E$ is the number of flights (edges). We iterate through the edges at most $K+1$ times.
- **Space Complexity**: $O(N + E)$ for the adjacency list and distance array.


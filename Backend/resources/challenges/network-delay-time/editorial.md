# Editorial — Network Delay Time

### Approach: Dijkstra's Algorithm
Dijkstra's algorithm finds the shortest path from a single source node to all other nodes in a weighted graph with non-negative edge weights.

**Algorithm**
1. **Adjacency List**: Convert the `times` list into an adjacency list where each node points to its neighbors and the weight of the edge between them.
2. **Distances Array**: Initialize `dists` array of size `n+1` with `Infinity`. Set `dists[k] = 0`.
3. **Priority Queue**: Use a Min-Heap to store pairs of `(distance, node)`. Initially, push `(0, k)`.
4. **Processing**:
   - While the heap is not empty:
     - Pop the element with the smallest distance `d`.
     - If `d` is greater than the already recorded `dists[node]`, skip it.
     - For each neighbor of the current node, calculate the potential new distance: `dists[node] + weight`.
     - If this new distance is smaller than the current `dists[neighbor]`, update `dists[neighbor]` and push the neighbor onto the heap.
5. **Result**: After the loop finishes, find the maximum value in the `dists` array. If any value remains `Infinity`, return `-1` (meaning not all nodes are reachable).

**Complexity**
- Time: $O(E \log V)$ where $E$ is the number of edges and $V$ is the number of vertices.
- Space: $O(V + E)$ to store the graph and distance array.

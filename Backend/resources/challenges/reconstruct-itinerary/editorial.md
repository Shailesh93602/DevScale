# Editorial — Reconstruct Itinerary

### Approach: Hierholzer's Algorithm (Eulerian Path)
This problem is equivalent to finding an **Eulerian Path** in a directed graph. An Eulerian path is a path that visits every edge exactly once.

**Key Requirements**
1. We must start from "JFK".
2. We must use all tickets (edges) once.
3. If there are multiple paths, we need the lexically smallest one.

**Algorithm**
1. **Adjacency List**: Represent the airports as nodes and tickets as directed edges. Use a data structure like a sorted list or a priority queue for neighbors to ensure we always try the lexically smallest destination first.
2. **DFS (Post-order)**: Perform a modified DFS starting from "JFK":
   - For a node, recursively visit its neighbors in lexicographical order.
   - Once all edges from a node are exhausted, push the node onto a stack (or `result` list).
3. **Reversal**: The stack will contain the itinerary in reverse order (because it's post-order traversal). Reverse it to get the correct path.

**Lexical Order Optimization**
By sorting the neighbors in descending order and using `pop()`, we can efficiently pick the smallest neighbor in $O(1)$ while maintaining post-order logic.

**Complexity**
- Time: $O(E \log E)$ where $E$ is the number of tickets. Sorting neighbors dominates the complexity. The DFS traversal is $O(E)$.
- Space: $O(V + E)$ where $V$ is the number of airports.

# Editorial — All Nodes Distance K in Binary Tree

### The Problem: Binary Tree as a Graph
In a standard binary tree, you can easily go "down" to children, but you cannot go "up" to parents. To find all nodes at distance $K$ from a target, the tree needs to be treated as an **undirected graph**.

### Approach: Graph Conversion + BFS
1.  **Annotate Parents**: Perform a DFS to traverse the tree and store the parent of each node in a Hash Map (`parents.set(node.val, parent)`). While doing this, find the actual reference to the `target` node.
2.  **Breadth-First Search (BFS)**:
    -   Start a BFS starting from the `target` node.
    -   Treat the node's `left` child, `right` child, and `parent` as neighbors in a graph.
    -   Use a `seen` set to avoid visiting the same node twice.
    -   When the BFS distance reaches $K$, the nodes currently in the queue (or layer) are precisely the nodes at distance $K$.

### Why BFS?
BFS is the natural choice for finding all nodes at a specific distance in an unweighted graph. It handles "layers" of distance efficiently.

### Complexity Analysis
- **Time Complexity**: $O(N)$ where $N$ is the number of nodes. We traverse the tree once with DFS and once with BFS.
- **Space Complexity**: $O(N)$ for the parent map, the `seen` set, and the BFS queue.

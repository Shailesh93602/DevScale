# Clone Graph

Given a reference of a node in a **[connected](https://en.wikipedia.org/wiki/Connectivity_(graph_theory)#Connected_graph) undirected graph**.

Return a [**deep copy**](https://en.wikipedia.org/wiki/Object_copying#Deep_copy) (clone) of the graph.

Each node in the graph contains a value (`int`) and a list (`List[Node]`) of its neighbors.

```
class Node {
    public int val;
    public List<Node> neighbors;
}
```

---

## Examples

**Example 1:**
```text
Input: adjList = [[2,4],[1,3],[2,4],[1,3]]
Output: [[2,4],[1,3],[2,4],[1,3]]
Explanation: Node 1's neighbors are nodes 2 and 4. Node 2's neighbors are nodes 1 and 3. Node 3's neighbors are nodes 2 and 4. Node 4's neighbors are nodes 1 and 3.
```

**Example 2:**
```text
Input: adjList = [[]]
Output: [[]]
Explanation: Node 1 has no neighbors.
```

**Example 3:**
```text
Input: adjList = []
Output: []
Explanation: This means the graph is empty.
```

---

## Constraints

- The number of nodes in the graph is in the range `[0, 100]`.
- `1 <= Node.val <= 100`
- `Node.val` is unique for each node.
- There are no repeated edges and no self-loops in the graph.
- The graph is connected and all nodes can be visited starting from the given node.

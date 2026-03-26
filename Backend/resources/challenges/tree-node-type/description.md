# Tree Node Type Classification

Each node in a tree can be one of three types:
1. **'Root'**: If the node is the root of the tree.
2. **'Inner'**: If the node is neither a leaf nor a root.
3. **'Leaf'**: If the node is a leaf node.

Write a solution to report the type of each node in the `Tree` table.

### Table: Tree
| Column Name | Type |
| :--- | :--- |
| id | int |
| p_id | int |

`id` is the primary key for this table.
Each row of this table contains information about the id of a node and the id of its parent node.

### Example 1:
**Input:**
Tree table:
| id | p_id |
| :--- | :--- |
| 1 | null |
| 2 | 1 |
| 3 | 1 |
| 4 | 2 |
| 5 | 2 |

**Output:**
| id | type |
| :--- | :--- |
| 1 | Root |
| 2 | Inner |
| 3 | Leaf |
| 4 | Leaf |
| 5 | Leaf |

**Explanation:**
- Node 1 is the root node because its parent id is null and it has child nodes 2 and 3.
- Node 2 is an inner node because it has parent node 1 and child nodes 4 and 5.
- Nodes 3, 4, and 5 are leaf nodes because they have parent nodes and they do not have any child nodes.

### Constraints:
- There is at least one node in the table.
- Each node can have at most one parent.

# Delete Node in a BST

Given a root node reference of a BST and a key, delete the node with the given key in the BST. Return the root node reference (possibly updated) of the BST.

The deletion can be divided into two stages:
1. Search for the node to remove.
2. If the node is found, delete it.

---

## Examples

**Example 1:**
```text
Input: root = [5,3,6,2,4,null,7], key = 3
Output: [5,4,6,2,null,null,7]
Explanation: Given key to delete is 3. Node 3 has two children, so we replace it with its in-order successor (4).
```

**Example 2:**
```text
Input: root = [5,3,6,2,4,null,7], key = 0
Output: [5,3,6,2,4,null,7]
Explanation: The tree does not contain a node with value 0, so the tree is unchanged.
```

**Example 3:**
```text
Input: root = [], key = 0
Output: []
```

---

## Constraints

- The number of nodes in the tree is in the range `[0, 10^4]`.
- `-10^5 <= Node.val <= 10^5`
- Each node has a unique value.

**Follow up:** Can you solve it with time complexity O(height of tree)?

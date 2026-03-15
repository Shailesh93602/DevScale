# Inorder Successor in BST

Given the `root` of a binary search tree and a node `p` in it, return the **in-order successor** of that node in the BST. If the given node has no in-order successor, return `null`.

The **in-order successor** of a node `p` is the node with the smallest key greater than `p.val`.

---

## Examples

**Example 1:**
```text
Input: root = [2,1,3], p = 1
Output: 2
Explanation: 1's in-order successor is 2.
```

**Example 2:**
```text
Input: root = [5,3,6,2,4,null,null,1], p = 6
Output: null
Explanation: 6 is the largest node, so there is no in-order successor.
```

---

## Constraints

- The number of nodes in the tree is in the range `[1, 10^4]`.
- `-10^5 <= Node.val <= 10^5`
- All values in the BST are unique.

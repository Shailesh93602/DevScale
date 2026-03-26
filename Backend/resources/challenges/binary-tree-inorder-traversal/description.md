# Binary Tree Inorder Traversal

Given the `root` of a binary tree, return *the inorder traversal of its nodes' values*.

An **inorder traversal** visits the nodes in the following order:
1. Left subtree
2. Root node
3. Right subtree

### Example 1:
**Input:** `root = [1, null, 2, 3]`
**Output:** `[1, 3, 2]`
**Explanation:** 
The tree looks like:
```
   1
    \
     2
    /
   3
```

### Example 2:
**Input:** `root = []`
**Output:** `[]`

### Constraints:
- The number of nodes in the tree is in the range `[0, 100]`.
- `-100 <= Node.val <= 100`

### Follow up:
Can you implement it iteratively (without recursion)?

# Insert into a Binary Search Tree

You are given the `root` node of a binary search tree (BST) and a `val` to insert into the tree. Return the root node of the BST after the insertion. It is **guaranteed** that the new value does not exist in the original BST.

There may exist multiple valid ways to do the insertion. As long as the tree remains a valid BST after insertion, any is accepted.

---

## Examples

**Example 1:**
```text
Input: root = [4,2,7,1,3], val = 5
Output: [4,2,7,1,3,5]
Explanation: Another accepted tree is [5,2,7,1,3,null,null,null,null,null,4].
```

**Example 2:**
```text
Input: root = [40,20,60,10,30,50,70], val = 25
Output: [40,20,60,10,30,50,70,null,null,25]
```

**Example 3:**
```text
Input: root = [], val = 5
Output: [5]
```

---

## Constraints

- The number of nodes in the tree is in the range `[0, 10^4]`.
- `-10^8 <= Node.val <= 10^8`
- All values in the BST are unique.
- `val` is guaranteed not to exist in the original BST.

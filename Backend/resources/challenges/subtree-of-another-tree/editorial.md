# Editorial — Subtree of Another Tree

## Approach 1: Recursive DFS (O(M * N) Time, O(max(M, N)) Space)

We can solve this recursively by answering two different questions:
1. Are these two particular trees exactly the same? (We know how to solve this from the *Same Tree* problem).
2. Is this tree a subtree of that tree? (Our main function).

If `subRoot` is null, it's technically always a subtree of any tree, so we return `true`.
If the main `root` is null (but `subRoot` is not), `subRoot` can't possibly be a subtree, so we return `false`.

If both trees are non-null, our main `isSubtree` function is just checking:
- Is `root` exactly the same as `subRoot`?
- OR, is `subRoot` a subtree of `root.left`?
- OR, is `subRoot` a subtree of `root.right`?

```typescript
function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  if (!p && !q) return true;
  if (!p || !q) return false;
  if (p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}

function isSubtree(root: TreeNode | null, subRoot: TreeNode | null): boolean {
  if (!subRoot) return true;
  if (!root) return false;

  if (isSameTree(root, subRoot)) {
    return true;
  }

  return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}
```

**Complexity:**
- **Time Complexity:** **$O(M \times N)$** where $M$ is the number of nodes in the `root` tree and $N$ is the number of nodes in `subRoot`. For every node we visit in the main tree, we might have to do a full `isSameTree` check which could scan all $N$ nodes of `subRoot` in the worst case (e.g., if many nodes look identical to `subRoot`'s root).
- **Space Complexity:** **$O(H)$** where $H$ is the height of the `root` tree, due to the call stack depth. Worst case $O(M)$.

---

## Approach 2: String Serialization (O(M + N) Time, O(M + N) Space)

You can convert both trees into strings (serialize them) using an in-order or pre-order traversal. 
Important detail: you *must* include markers for `null` nodes, and markers indicating the start and end of nodes (to prevent a node value like `12` from matching with `2` by string search).

Once serialized into strings `S_root` and `S_subRoot`, the problem literally becomes a substring search! You can just check if `S_root.includes(S_subRoot)`.

**Complexity:**
- **Time Complexity:** **$O(M + N)$**. $O(M+N)$ to traverse and serialize both trees. The substring matching takes $O(M \times N)$ natively in some languages, but algorithms like KMP can do substring search in $O(M+N)$.
- **Space Complexity:** **$O(M + N)$** to store the serialized string representations.

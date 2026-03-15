# Editorial — Same Tree

## Approach 1: Recursive Depth-First Search (DFS) (O(N) Time, O(H) Space)

The simplest and most elegant way to solve this is through recursion.

Two trees `p` and `q` are considered "the same" if and only if:
1. They are both `null` (empty strings are identical).
2. They are both NOT `null`, AND their values are exactly the same (`p.val === q.val`), AND their left subtrees are identical, AND their right subtrees are identical.

If one is `null` but the other isn't, they are instantly not the same.

```typescript
function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  // If both are null, they are the same
  if (p === null && q === null) return true;
  
  // If one is null but the other isn't, they are not the same
  if (p === null || q === null) return false;
  
  // If their values are different, they are not the same
  if (p.val !== q.val) return false;
  
  // They are only the same if BOTH left subtrees and right subtrees are the same
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}
```

This can be shortened to a very clean one-liner if you're feeling fancy:
```typescript
function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  if (p === null || q === null) return p === q;
  return p.val === q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}
```

**Complexity:**
- **Time Complexity:** **O(N)**. We visit every single node in the tree exactly once, where $N$ is the smaller number of nodes between both trees (as we return `false` early if they don't match).
- **Space Complexity:** **O(H)** where $H$ is the height of the tree, representing the recursive call stack. In the worst case (unbalanced line), $O(N)$. For a perfectly balanced tree, $O(\log N)$.

---

## Approach 2: Iterative Breadth-First Search (BFS) (O(N) Time, O(N) Space)

We can also do this iteratively using a queue to traverse through both trees simultaneously in a level-order fashion.

We pop a pair of nodes from the queue and compare them. If they match, we push their left children together as a pair, and their right children together as a pair.

```typescript
function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  const queue: (TreeNode | null)[] = [p, q];

  while (queue.length > 0) {
    const node1 = queue.shift();
    const node2 = queue.shift();

    if (node1 === null && node2 === null) continue;
    if (node1 === null || node2 === null) return false;
    if (node1.val !== node2.val) return false;

    // Push the children in pairs
    queue.push(node1.left);
    queue.push(node2.left);
    queue.push(node1.right);
    queue.push(node2.right);
  }

  return true;
}
```

**Complexity:**
- **Time Complexity:** **O(N)**. Every node is processed exactly once.
- **Space Complexity:** **O(N)**. The queue will store at most the lowest level of nodes from both trees.

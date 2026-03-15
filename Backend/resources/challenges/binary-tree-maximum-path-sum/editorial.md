# Editorial — Binary Tree Maximum Path Sum

## Approach: Post-order DFS with Global Max (O(N) Time, O(H) Space)

The challenging part of this problem is that a path can go any direction through any node. A path could be:
- A single node
- A straight branch going down
- A V-shape: left branch → node → right branch

For each node, we compute two things:
1. **The maximum gain we can contribute to a parent** (one-sided): `node.val + max(leftGain, rightGain, 0)`. We cap at `0` because if both sides are negative, it's better to not include the subtree.
2. **The maximum path sum passing THROUGH this node** (two-sided): `node.val + max(leftGain, 0) + max(rightGain, 0)`. We update our global maximum with this value.

We use a post-order traversal (process children before parent) and return only the **one-sided** gain up to the parent.

```typescript
function maxPathSum(root: TreeNode | null): number {
  let globalMax = -Infinity;

  // Returns the maximum ONE-SIDED gain from this subtree
  function maxGain(node: TreeNode | null): number {
    if (node === null) return 0;

    // Recursively get max gain from each child (use 0 if negative)
    const leftGain = Math.max(maxGain(node.left), 0);
    const rightGain = Math.max(maxGain(node.right), 0);

    // Update global max with the path that goes THROUGH this node
    globalMax = Math.max(globalMax, node.val + leftGain + rightGain);

    // Return the ONE-SIDED gain for the parent
    return node.val + Math.max(leftGain, rightGain);
  }

  maxGain(root);
  return globalMax;
}
```

**Complexity:**
- **Time Complexity:** **O(N)**. Every node is visited exactly once.
- **Space Complexity:** **O(H)** for the recursive call stack, where $H$ is the height of the tree.

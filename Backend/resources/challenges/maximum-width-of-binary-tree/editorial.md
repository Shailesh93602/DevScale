# Editorial — Maximum Width of Binary Tree

## Approach: BFS with Level Indexing (O(N) Time, O(W) Space)

The problem asks for the maximum horizontal distance between the first and last non-null node in any level.

A Level Order Traversal (BFS) is the most intuitive approach. During BFS, we track each node and its "index" if it were part of a full binary tree.
Given a parent node at index `i`, its:
- Left child is at index `2 * i`.
- Right child is at index `2 * i + 1`.

The width of any level is `last_index - first_index + 1`.

### A Critical Optimization: Avoiding Overflow
Tree depth can be up to 3000, which means indices can reach `2^3000`. This will clearly cause a numerical overflow of `Number.MAX_SAFE_INTEGER` in JavaScript (or 32-bit/64-bit limits in other languages). 

**Solution 1:** Normalize the indices at the start of every BFS level by subtracting the first element's index from all subsequent indices processing in that level `(currIdx - startIdx)`.

**Solution 2:** Use JavaScript's arbitrary-precision `BigInt` wrapper around the index. E.g. `2n * index`. This avoids overflow implicitly, although normalization is still a good idea.

```typescript
function widthOfBinaryTree(root: TreeNode | null): number {
  if (!root) return 0;
  let maxWidth = 0n;
  const queue: { node: TreeNode; index: bigint }[] = [{ node: root, index: 0n }];

  while (queue.length > 0) {
    const size = queue.length;
    const startIdx = queue[0].index;
    let endIdx = startIdx;

    for (let i = 0; i < size; i++) {
      const { node, index } = queue.shift()!;
      endIdx = index;
      
      const normalizedIdx = index - startIdx;
      
      if (node.left) queue.push({ node: node.left, index: 2n * normalizedIdx });
      if (node.right) queue.push({ node: node.right, index: 2n * normalizedIdx + 1n });
    }
    
    const w = endIdx - startIdx + 1n;
    if (w > maxWidth) maxWidth = w;
  }
  return Number(maxWidth);
}
```

**Complexity:**
- **Time:** **O(N)** — every node is visited exactly once.
- **Space:** **O(W)** — queue occupies space proportional to the maximum width of the tree `W` (which is roughly `O(N/2)` at max for a full tree).

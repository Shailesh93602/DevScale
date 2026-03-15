# Editorial — Sum Root to Leaf Numbers

## Approach: Depth-First Search (O(N) Time, O(H) Space)

A root-to-leaf path number is formed by appending each node's value as a digit. Mathematically, for each parent node, its value is shifted one decimal place to the left (`current_val * 10`) and added to the child's value. 
- For instance, going from `1` down to `2`, `1 * 10 + 2 = 12`.

We can use Depth-First Search (DFS) to traverse down the tree:
1. Pass the accumulated value down to children.
2. If the current node is a leaf (no `left` and `right` children), return the accumulated value.
3. Otherwise, recursively calculate the sum of the left and right subtrees and return their sum.

```typescript
function sumNumbers(root: TreeNode | null): number {
  if (!root) return 0;

  function dfs(node: TreeNode, currentSum: number): number {
    const sum = currentSum * 10 + node.val;

    if (!node.left && !node.right) return sum;

    let total = 0;
    if (node.left) total += dfs(node.left, sum);
    if (node.right) total += dfs(node.right, sum);

    return total;
  }

  return dfs(root, 0);
}
```

**Complexity:**
- **Time:** **O(N)** — every node is visited exactly once.
- **Space:** **O(H)** — where `H` is the height of the tree. The maximum depth of the recursive call stack is limited by the tree's height (`O(N)` for a skewed tree, `O(log N)` for a balanced tree).

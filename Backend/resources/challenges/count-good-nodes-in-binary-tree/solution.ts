// O(N) Time, O(H) Space — DFS tracking max value on path
function goodNodes(root: TreeNode): number {
  function dfs(node: TreeNode | null, maxSoFar: number): number {
    if (node === null) return 0;

    let count = 0;
    if (node.val >= maxSoFar) {
      count = 1; // This node is good!
    }

    const newMax = Math.max(maxSoFar, node.val);
    count += dfs(node.left, newMax);
    count += dfs(node.right, newMax);

    return count;
  }

  return dfs(root, -Infinity);
}

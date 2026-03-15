class TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
  }
}

// O(N) Time, O(H) Space — DFS Traversal
function sumNumbers(root: TreeNode | null): number {
  if (!root) return 0;

  function dfs(node: TreeNode, currentSum: number): number {
    const sum = currentSum * 10 + node.val;

    if (!node.left && !node.right) {
      return sum;
    }

    let total = 0;
    if (node.left) total += dfs(node.left, sum);
    if (node.right) total += dfs(node.right, sum);

    return total;
  }

  return dfs(root, 0);
}

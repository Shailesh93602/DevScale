// O(N) Time, O(H) Space — Recursive DFS subtracting from target
function hasPathSum(root: TreeNode | null, targetSum: number): boolean {
  if (root === null) return false;

  // If it's a leaf, check if the remaining sum equals the node's value
  if (root.left === null && root.right === null) {
    return root.val === targetSum;
  }

  // Recurse into children with remaining sum
  return (
    hasPathSum(root.left, targetSum - root.val) ||
    hasPathSum(root.right, targetSum - root.val)
  );
}

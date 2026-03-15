// O(N) Time, O(H) Space — Post-order DFS tracking global max diameter
function diameterOfBinaryTree(root: TreeNode | null): number {
  let maxDiameter = 0;

  function height(node: TreeNode | null): number {
    if (node === null) return 0;

    const leftH = height(node.left);
    const rightH = height(node.right);

    // Diameter through this node = sum of both subtree heights
    maxDiameter = Math.max(maxDiameter, leftH + rightH);

    // Return the height of this subtree
    return 1 + Math.max(leftH, rightH);
  }

  height(root);
  return maxDiameter;
}

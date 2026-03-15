// O(N) Time, O(H) Space — Post-order DFS with global max
function maxPathSum(root: TreeNode | null): number {
  let globalMax = -Infinity;

  function maxGain(node: TreeNode | null): number {
    if (node === null) return 0;

    const leftGain = Math.max(maxGain(node.left), 0);
    const rightGain = Math.max(maxGain(node.right), 0);

    // Update global max with two-sided path through this node
    globalMax = Math.max(globalMax, node.val + leftGain + rightGain);

    // Return one-sided gain for the parent
    return node.val + Math.max(leftGain, rightGain);
  }

  maxGain(root);
  return globalMax;
}

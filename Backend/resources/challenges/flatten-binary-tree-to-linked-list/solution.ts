// O(N) Time, O(1) Space — Morris traversal / iterative rewiring
function flatten(root: TreeNode | null): void {
  let curr = root;

  while (curr !== null) {
    if (curr.left !== null) {
      // Find the rightmost node of the left subtree
      let rightmost = curr.left;
      while (rightmost.right !== null) {
        rightmost = rightmost.right;
      }

      // Wire the rightmost node to the current right subtree
      rightmost.right = curr.right;

      // Move left subtree to the right and clear left
      curr.right = curr.left;
      curr.left = null;
    }

    curr = curr.right;
  }
}

// O(log^2 N) Time, O(log N) Space — Leveraging complete tree property
function countNodes(root: TreeNode | null): number {
  if (root === null) return 0;

  let leftH = 0, rightH = 0;
  let left: TreeNode | null = root;
  let right: TreeNode | null = root;

  while (left !== null) { leftH++; left = left.left; }
  while (right !== null) { rightH++; right = right.right; }

  // If the left-most depth equals right-most depth, it's a perfect tree
  if (leftH === rightH) {
    return (1 << leftH) - 1; // 2^h - 1
  }

  // Otherwise, count recursively
  return 1 + countNodes(root.left) + countNodes(root.right);
}

// O(H) Time, O(1) Space — Iterative using BST property
function lowestCommonAncestor(
  root: TreeNode | null,
  p: TreeNode | null,
  q: TreeNode | null
): TreeNode | null {
  let node = root;

  while (node !== null) {
    if (p!.val < node.val && q!.val < node.val) {
      node = node.left;
    } else if (p!.val > node.val && q!.val > node.val) {
      node = node.right;
    } else {
      return node;
    }
  }

  return null;
}

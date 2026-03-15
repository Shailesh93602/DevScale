// O(N) Time, O(H) Space — Bottom-up recursion with sentinel value
/**
 * Definition for a binary tree node.
 * class TreeNode {
 *     val: number
 *     left: TreeNode | null
 *     right: TreeNode | null
 *     constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.left = (left===undefined ? null : left)
 *         this.right = (right===undefined ? null : right)
 *     }
 * }
 */

function isBalanced(root: TreeNode | null): boolean {
  // Returns the height if balanced, -1 if unbalanced
  function checkHeight(node: TreeNode | null): number {
    if (node === null) return 0;

    const leftH = checkHeight(node.left);
    if (leftH === -1) return -1;

    const rightH = checkHeight(node.right);
    if (rightH === -1) return -1;

    if (Math.abs(leftH - rightH) > 1) return -1;

    return 1 + Math.max(leftH, rightH);
  }

  return checkHeight(root) !== -1;
}

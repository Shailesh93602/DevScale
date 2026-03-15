// O(H) Time, O(1) Space — BST property search
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

function inorderSuccessor(root: TreeNode | null, p: TreeNode): TreeNode | null {
  let successor: TreeNode | null = null;
  let current = root;

  while (current !== null) {
    if (current.val > p.val) {
      // Current node could be the successor
      successor = current;
      // Search left for a closer (smaller) successor
      current = current.left;
    } else {
      // Current value is <= p.val, need to go right
      current = current.right;
    }
  }

  return successor;
}

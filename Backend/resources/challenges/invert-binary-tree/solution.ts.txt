// O(N) Time, O(H) Space — Recursive DFS
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

function invertTree(root: TreeNode | null): TreeNode | null {
  // Base case: empty tree
  if (root === null) {
      return null;
  }

  // Swap left and right subtrees recursively
  const right = invertTree(root.right);
  const left = invertTree(root.left);

  // Re-assign them to the root
  root.left = right;
  root.right = left;

  return root;
}

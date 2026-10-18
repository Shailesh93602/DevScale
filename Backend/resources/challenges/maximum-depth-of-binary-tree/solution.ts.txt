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

function maxDepth(root: TreeNode | null): number {
  if (root === null) {
      return 0;
  }
  
  // Recursively find depth of left and right subtrees
  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);
  
  // Return the maximum and add 1 for the current node
  return 1 + Math.max(leftDepth, rightDepth);
}

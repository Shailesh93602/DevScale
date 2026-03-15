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

function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  // If both are null, they are identical empty trees
  if (p === null && q === null) return true;
  
  // If one is null but the other isn't, they differ
  if (p === null || q === null) return false;
  
  // If their values are different, they differ
  if (p.val !== q.val) return false;
  
  // Recursively check if BOTH left subtrees and right subtrees are identical
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}

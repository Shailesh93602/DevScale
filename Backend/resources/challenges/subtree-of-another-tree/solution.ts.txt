// O(M * N) Time, O(max(M, N) Space) — Recursive DFS with helper function
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

// Helper function to check if two trees are identical
function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  if (p === null && q === null) return true;
  if (p === null || q === null) return false;

  if (p.val !== q.val) return false;

  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}

// Main function to check for subtree
function isSubtree(root: TreeNode | null, subRoot: TreeNode | null): boolean {
  // If subRoot is null, it is always a subtree
  if (subRoot === null) return true;

  // If root is null, subRoot cannot be a subtree
  if (root === null) return false;

  // Is it identical right here at the current root?
  if (isSameTree(root, subRoot)) {
    return true;
  }

  // If not identical, check if it's a subtree of the left child or the right child
  return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}

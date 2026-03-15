// O(N) Time, O(log N) Space — Recursive divide and conquer
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

function sortedArrayToBST(nums: number[]): TreeNode | null {
  function build(left: number, right: number): TreeNode | null {
    if (left > right) return null;

    // Always choose the middle element as root
    const mid = Math.floor((left + right) / 2);
    const node = new TreeNode(nums[mid]);

    // Recursively build left and right subtrees
    node.left = build(left, mid - 1);
    node.right = build(mid + 1, right);

    return node;
  }

  return build(0, nums.length - 1);
}

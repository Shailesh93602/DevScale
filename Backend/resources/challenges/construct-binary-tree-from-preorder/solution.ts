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

export function bstFromPreorder(preorder: number[]): TreeNode | null {
  let index = 0;

  function build(limit: number): TreeNode | null {
    if (index === preorder.length || preorder[index] > limit) {
      return null;
    }

    const val = preorder[index++];
    const node = new TreeNode(val);
    node.left = build(val); // Values less than val go left
    node.right = build(limit); // Values greater than val but less than limit go right
    return node;
  }

  return build(Infinity);
}

class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = val === undefined ? 0 : val;
    this.left = left === undefined ? null : left;
    this.right = right === undefined ? null : right;
  }
}

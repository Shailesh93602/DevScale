// O(H) Time, O(H) Space — Recursive deletion
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

function deleteNode(root: TreeNode | null, key: number): TreeNode | null {
  if (root === null) return null;

  if (key < root.val) {
    // Key is in the left subtree
    root.left = deleteNode(root.left, key);
  } else if (key > root.val) {
    // Key is in the right subtree
    root.right = deleteNode(root.right, key);
  } else {
    // Found the node to delete
    if (root.left === null) return root.right;
    if (root.right === null) return root.left;

    // Two children: find in-order successor (smallest in right subtree)
    let successor = root.right;
    while (successor.left !== null) {
      successor = successor.left;
    }

    // Replace current node's value with successor's value
    root.val = successor.val;
    // Delete the successor from right subtree
    root.right = deleteNode(root.right, successor.val);
  }

  return root;
}

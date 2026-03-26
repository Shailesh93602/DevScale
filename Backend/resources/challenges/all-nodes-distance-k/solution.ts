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

function distanceK(root: any, target: number, k: number): number[] {
  const parents = new Map<number, any>();
  let targetNode: any = null;

  // DFS to map parents and find the target node
  const traverse = (node: any, p: any) => {
    if (!node) return;
    if (node.val === target) targetNode = node;
    parents.set(node.val, p);
    traverse(node.left, node);
    traverse(node.right, node);
  };

  traverse(root, null);

  if (!targetNode) return [];

  const queue: [any, number][] = [[targetNode, 0]];
  const seen = new Set<number>([targetNode.val]);
  const result: number[] = [];

  while (queue.length > 0) {
    const [curr, dist] = queue.shift()!;

    if (dist === k) {
      result.push(curr.val);
      continue;
    }

    // Neighbors: left, right, and parent
    const neighbors = [curr.left, curr.right, parents.get(curr.val)];
    for (const next of neighbors) {
      if (next && !seen.has(next.val)) {
        seen.add(next.val);
        queue.push([next, dist + 1]);
      }
    }
  }

  return result;
}

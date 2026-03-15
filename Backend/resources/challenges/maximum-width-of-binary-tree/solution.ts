class TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
  }
}

// O(N) Time, O(W) Space — BFS with BigInt for index safety
function widthOfBinaryTree(root: TreeNode | null): number {
  if (!root) return 0;

  let maxWidth = 0n;
  const queue: { node: TreeNode; index: bigint }[] = [{ node: root, index: 0n }];

  while (queue.length > 0) {
    const size = queue.length;

    // Normalize indices by subtracting the first element's index to avoid huge numbers,
    // though BigInt inherently prevents overflow, it saves space.
    const startIdx = queue[0].index;
    let endIdx = startIdx;

    for (let i = 0; i < size; i++) {
      const { node, index } = queue.shift()!;
      endIdx = index; // The last popped index in a level is the endIdx

      const normalizedIdx = index - startIdx;

      if (node.left) {
        queue.push({ node: node.left, index: 2n * normalizedIdx });
      }
      if (node.right) {
        queue.push({ node: node.right, index: 2n * normalizedIdx + 1n });
      }
    }

    const currentWidth = endIdx - startIdx + 1n;
    if (currentWidth > maxWidth) maxWidth = currentWidth;
  }

  return Number(maxWidth);
}

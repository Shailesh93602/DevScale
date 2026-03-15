// O(N) Time, O(H) Space — BFS, take last node per level
function rightSideView(root: TreeNode | null): number[] {
  const result: number[] = [];
  if (root === null) return result;

  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;

    for (let i = 0; i < levelSize; i++) {
      const current = queue.shift()!;

      // Only add the last node value in this level
      if (i === levelSize - 1) {
        result.push(current.val);
      }

      if (current.left !== null) queue.push(current.left);
      if (current.right !== null) queue.push(current.right);
    }
  }

  return result;
}

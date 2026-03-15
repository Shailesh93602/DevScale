// O(N) Time, O(N) Space — BFS with queue
function levelOrder(root: TreeNode | null): number[][] {
  const result: number[][] = [];
  if (root === null) return result;

  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const levelValues: number[] = [];

    for (let i = 0; i < levelSize; i++) {
      const current = queue.shift()!;
      levelValues.push(current.val);

      if (current.left !== null) queue.push(current.left);
      if (current.right !== null) queue.push(current.right);
    }

    result.push(levelValues);
  }

  return result;
}

// O(N) Time, O(H) Space — Iterative in-order traversal
function kthSmallest(root: TreeNode | null, k: number): number {
  const stack: TreeNode[] = [];
  let curr: TreeNode | null = root;

  while (curr !== null || stack.length > 0) {
    // Go as far left as possible
    while (curr !== null) {
      stack.push(curr);
      curr = curr.left;
    }

    // Process the current smallest node
    curr = stack.pop()!;
    k--;

    if (k === 0) return curr.val;

    // Move to the right subtree
    curr = curr.right;
  }

  return -1; // k is always valid per constraints
}

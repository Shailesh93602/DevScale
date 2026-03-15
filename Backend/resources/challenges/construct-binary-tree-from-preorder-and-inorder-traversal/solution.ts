// O(N) Time, O(N) Space — Divide and conquer with HashMap for O(1) inorder index lookup
function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
  const inorderIndexMap = new Map<number, number>();
  for (let i = 0; i < inorder.length; i++) {
    inorderIndexMap.set(inorder[i], i);
  }

  let preorderIdx = 0;

  function build(left: number, right: number): TreeNode | null {
    if (left > right) return null;

    const rootVal = preorder[preorderIdx++];
    const root = new TreeNode(rootVal);

    const inorderIdx = inorderIndexMap.get(rootVal)!;

    // Build left subtree first (preorder: root, left, right)
    root.left = build(left, inorderIdx - 1);
    root.right = build(inorderIdx + 1, right);

    return root;
  }

  return build(0, inorder.length - 1);
}

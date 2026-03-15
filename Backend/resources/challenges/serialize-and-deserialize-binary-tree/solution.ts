// O(N) Time, O(N) Space — Pre-order DFS serialize/deserialize
function serialize(root: TreeNode | null): string {
  const parts: string[] = [];

  function dfs(node: TreeNode | null): void {
    if (node === null) {
      parts.push('N');
      return;
    }
    parts.push(String(node.val));
    dfs(node.left);
    dfs(node.right);
  }

  dfs(root);
  return parts.join(',');
}

function deserialize(data: string): TreeNode | null {
  const vals = data.split(',');
  let idx = 0;

  function build(): TreeNode | null {
    if (vals[idx] === 'N') {
      idx++;
      return null;
    }
    const node = new TreeNode(parseInt(vals[idx++]));
    node.left = build();
    node.right = build();
    return node;
  }

  return build();
}

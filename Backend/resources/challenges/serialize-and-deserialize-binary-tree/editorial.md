# Editorial — Serialize and Deserialize Binary Tree

## Approach: Pre-order DFS (O(N) Time, O(N) Space)

**Serialization:** Do a pre-order DFS (root → left → right). Append node values to a list, and use `'N'` for null nodes. Join with commas.

**Deserialization:** Split the string by commas. Maintain an index. Recursively:
- If current value is `'N'`, return null and advance index.
- Otherwise, create a node with the current value, advance index, build left subtree, build right subtree.

```typescript
function serialize(root: TreeNode | null): string {
  const parts: string[] = [];

  function dfs(node: TreeNode | null): void {
    if (node === null) { parts.push('N'); return; }
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
    if (vals[idx] === 'N') { idx++; return null; }
    const node = new TreeNode(parseInt(vals[idx++]));
    node.left = build();
    node.right = build();
    return node;
  }

  return build();
}
```

**Complexity:**
- **Time:** **O(N)** for both serialize and deserialize — every node visited once.
- **Space:** **O(N)** for the serialized string and the call stack.

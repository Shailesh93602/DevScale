# Editorial — Minimum Height Trees

## Approach: Topological Sort/Trimming Leaves (O(V) Time, O(V) Space)

The Root of a MHT is basically the "topological center" of a tree. Any tree has at most **two** such centers.

Instead of computing the height of the tree from every single node, we can progressively trim the leaf nodes layer by layer — like peeling an onion — until `2` or fewer nodes remain. 

1. Calculate the degree (number of edges) for every node.
2. An undirected tree node is a leaf if its `degree === 1`. Initialize a queue of leaves.
3. While `remainingNodes > 2`:
   - Decrement the count of total `remainingNodes` by the number of current leaves.
   - For every current leaf, find its neighbor and `degree[neighbor]--`.
   - If the neighbor's degree becomes `1`, it is now a leaf. Add it to the new batch.
   - Replace the old batch of leaves with the new batch.
4. The remaining nodes (at most 2) are the MHT roots.

```typescript
function findMinHeightTrees(n: number, edges: number[][]): number[] {
  if (n === 1) return [0];

  const adj: number[][] = Array.from({ length: n }, () => []);
  const degree = new Array(n).fill(0);

  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); degree[u]++; degree[v]++; }

  let leaves: number[] = [];
  for (let i = 0; i < n; i++) if (degree[i] === 1) leaves.push(i);

  let remaining = n;
  while (remaining > 2) {
    remaining -= leaves.length;
    let nextLeaves = [];
    for (const leaf of leaves) {
      for (const nb of adj[leaf]) {
        if (--degree[nb] === 1) nextLeaves.push(nb);
      }
    }
    leaves = nextLeaves;
  }
  return leaves;
}
```

**Complexity:**
- **Time/Space:** **O(V)** since every vertex and edge is processed at most twice. Trees always have `E = V-1` edges, making this O(V).

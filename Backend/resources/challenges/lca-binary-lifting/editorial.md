# Editorial — LCA using Binary Lifting

### Concept
Binary Lifting is an efficient way to find the Lowest Common Ancestor (LCA) in a tree. The core idea is to precompute the $2^j$-th ancestor for every node $i$ and every $j \in [0, \log N]$.

### Preprocessing
We use a 2D array `up[N][LOG]`:
- `up[i][0]` is the immediate parent of node `i`.
- `up[i][j] = up[up[i][j-1]][j-1]`. This means the $2^j$-th ancestor is the $2^{j-1}$-th ancestor of the $2^{j-1}$-th ancestor ($2^{j-1} + 2^{j-1} = 2^j$).

This can be filled using a single DFS traversal in $O(N \log N)$.

### Query Resolution
To find `getLCA(u, v)`:
1. **Depth Alignment**: If $u$ is deeper than $v$, we "lift" $u$ using the precomputed `up` table until `depth(u) == depth(v)`. We use the binary representation of the depth difference to jump.
2. **The Jump**: If $u$ now equals $v$, $v$ was an ancestor of $u$, so $v$ is the LCA.
3. **Simultaneous Lift**: If not, we iterate $j$ from $LOG$ down to $0$. If `up[u][j] != up[v][j]`, we lift both $u$ and $v$ to their $2^j$-th ancestors.
4. **Final Step**: After the loop, $u$ and $v$ will be children of the LCA. Return `up[u][0]`.

### Complexity
- **Preprocessing**: $O(N \log N)$ time and space.
- **Query**: $O(\log N)$ time.


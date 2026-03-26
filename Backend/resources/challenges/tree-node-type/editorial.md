# Editorial — Tree Node Type Classification

### Logic
The problem asks us to classify each node based on its position in the tree:

1. **Root**: A node that has no parent (`p_id IS NULL`).
2. **Inner**: A node that is not a root (has a `p_id`) but is a parent to someone else (its `id` exists in the `p_id` column).
3. **Leaf**: A node that is not a root and is not a parent to anyone else.

### SQL Implementation
We can use a `CASE` statement to check these conditions in order:

```sql
SELECT
    id,
    CASE
        WHEN p_id IS NULL THEN 'Root'
        WHEN id IN (SELECT p_id FROM Tree) THEN 'Inner'
        ELSE 'Leaf'
    END AS type
FROM Tree;
```

**Wait, what about the leaf nodes for simple trees?**
The order of conditions in `CASE` matters. By checking `p_id IS NULL` first, we catch the root. Then, by checking if the `id` exists in the `p_id` column, we catch all nodes that have children (excluding the root which was already caught). Everything else must be a leaf.

**Complexity**
- Time: $O(N^2)$ in the worst case for some SQL engines due to the `IN (subquery)` check, but can be $O(N \log N)$ or $O(N)$ with proper indexing or if transformed into a JOIN.
- Space: $O(N)$ for the result.

# Editorial — Rank Scores

### Window Functions: DENSE_RANK()
SQL provides several functions for ranking rows based on a specific column.

- `ROW_NUMBER()`: Assigns a unique, consecutive number to each row (1, 2, 3, 4, 5).
- `RANK()`: Assigns the same rank to identical values, but leaves gaps in the sequence (1, 1, 3, 4).
- `DENSE_RANK()`: Assigns the same rank to identical values and preserves consecutive integers (1, 1, 2, 3).

The problem explicitly asks for **no holes between ranks**, which points directly to `DENSE_RANK()`.

### SQL Implementation
```sql
SELECT
    score,
    DENSE_RANK() OVER (ORDER BY score DESC) AS 'rank'
FROM Scores
ORDER BY score DESC;
```

**Note on Reserved Keywords**: `rank` is a reserved word in many SQL systems. It's best practice to use quotes (like `'rank'` or \`rank\`) when using it as an alias.

**Alternative (Subquery)**
If window functions are not available, you can use a correlated subquery to count how many distinct scores are greater than or equal to the current score:
```sql
SELECT
  s1.score,
  (SELECT COUNT(DISTINCT s2.score) FROM Scores s2 WHERE s2.score >= s1.score) AS 'rank'
FROM Scores s1
ORDER BY s1.score DESC;
```

**Complexity**
- Time: $O(N \log N)$ for window functions (sorting overhead). Subquery approach is $O(N^2)$.
- Space: $O(N)$ for the result.

# Editorial — Article Views I

## Problem Summary

Find all authors who have viewed at least one of their own articles. An author views their own article when `author_id = viewer_id`.

## Approach 1: Simple Filter with DISTINCT

```sql
SELECT DISTINCT author_id AS id
FROM Views
WHERE author_id = viewer_id
ORDER BY id;
```

**Explanation:**
1. Filter rows where the author is also the viewer (`author_id = viewer_id`).
2. Use `DISTINCT` to remove duplicate author IDs (since an author may have viewed their own articles multiple times).
3. Sort the result by `id` in ascending order.

**Complexity:** O(n) where n is the number of rows in the Views table.

## Approach 2: Using GROUP BY

```sql
SELECT author_id AS id
FROM Views
WHERE author_id = viewer_id
GROUP BY author_id
ORDER BY id;
```

**Explanation:**
1. Filter rows where the author viewed their own article.
2. Use `GROUP BY` instead of `DISTINCT` to eliminate duplicates.
3. Sort by `id`.

Both approaches are equivalent in performance for this problem.

## Key Insight

The key to this problem is recognizing that a "self-view" happens when `author_id = viewer_id`. Since the table may contain duplicates, we must use `DISTINCT` or `GROUP BY` to return each author only once.

# Editorial — Movie Rating

## Problem Summary

Two separate queries combined with UNION ALL: find the top rater and the highest-rated movie in Feb 2020.

## Approach: UNION ALL of Two Subqueries

```sql
(SELECT u.name AS results
 FROM MovieRating mr
 JOIN Users u ON mr.user_id = u.user_id
 GROUP BY u.name
 ORDER BY COUNT(*) DESC, u.name ASC
 LIMIT 1)
UNION ALL
(SELECT m.title AS results
 FROM MovieRating mr
 JOIN Movies m ON mr.movie_id = m.movie_id
 WHERE mr.created_at BETWEEN '2020-02-01' AND '2020-02-29'
 ORDER BY AVG(mr.rating) DESC, m.title ASC
 LIMIT 1);
```

**Explanation:**
1. First query: join MovieRating with Users, group by user name, count ratings, order by count desc then name asc, take top 1.
2. Second query: filter to February 2020, join with Movies, group by movie title, order by avg rating desc then title asc, take top 1.
3. UNION ALL combines the two results.

## Key Insight

This is a two-part problem combined with UNION ALL. Each part is a standard aggregation with ORDER BY and LIMIT 1. Use UNION ALL (not UNION) since the results might theoretically be the same string and we always want exactly 2 rows.

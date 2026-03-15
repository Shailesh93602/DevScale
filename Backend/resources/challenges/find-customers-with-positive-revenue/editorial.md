# Editorial — Find Customers With Positive Revenue

## Problem Summary

Find all customers whose total revenue (sum of revenue across all years) is strictly positive.

## Approach 1: GROUP BY with HAVING

```sql
SELECT customer_id
FROM Customers
GROUP BY customer_id
HAVING SUM(revenue) > 0;
```

**Explanation:**
1. Group all rows by customer_id.
2. Compute the sum of revenue for each customer.
3. Use HAVING to filter for customers with positive total revenue.

This is a straightforward aggregation problem.

## Approach 2: Subquery

```sql
SELECT customer_id
FROM (
    SELECT customer_id, SUM(revenue) AS total_revenue
    FROM Customers
    GROUP BY customer_id
) sub
WHERE total_revenue > 0;
```

**Explanation:**
1. First compute total revenue per customer in a subquery.
2. Filter in the outer query.

Both approaches are equivalent in performance.

## Key Insight

Use SUM() with GROUP BY to aggregate revenue per customer, then HAVING to filter. Remember that HAVING filters after aggregation, while WHERE filters before.

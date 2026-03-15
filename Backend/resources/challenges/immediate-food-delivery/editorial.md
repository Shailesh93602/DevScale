# Editorial — Immediate Food Delivery II

## Problem Summary

Find the percentage of customers whose first order was immediate (order_date = customer_pref_delivery_date).

## Approach 1: Subquery with MIN

```sql
SELECT ROUND(
    100.0 * SUM(CASE WHEN order_date = customer_pref_delivery_date THEN 1 ELSE 0 END) / COUNT(*),
    2
) AS immediate_percentage
FROM Delivery
WHERE (customer_id, order_date) IN (
    SELECT customer_id, MIN(order_date)
    FROM Delivery
    GROUP BY customer_id
);
```

**Explanation:**
1. The subquery finds each customer's first order date (MIN).
2. Filter the main table to only first orders.
3. Count how many first orders are immediate and divide by total first orders.

## Approach 2: Window Function

```sql
SELECT ROUND(
    100.0 * SUM(CASE WHEN order_date = customer_pref_delivery_date THEN 1 ELSE 0 END) / COUNT(*),
    2
) AS immediate_percentage
FROM (
    SELECT *,
        ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) AS rn
    FROM Delivery
) sub
WHERE rn = 1;
```

**Explanation:**
1. Use ROW_NUMBER() to rank orders per customer by date.
2. Filter to only the first order (rn = 1).
3. Calculate the immediate percentage.

## Key Insight

The key challenge is identifying each customer's first order. Use either MIN(order_date) with GROUP BY or ROW_NUMBER() window function. Then calculate the percentage with CASE WHEN for the immediate condition.

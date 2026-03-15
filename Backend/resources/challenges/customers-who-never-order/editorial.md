# Editorial — Customers Who Never Order

## Problem Summary

Find all customers who have never placed an order. This requires finding rows in the Customers table that have no matching row in the Orders table.

## Approach 1: NOT IN Subquery

```sql
SELECT name AS Customers
FROM Customers
WHERE id NOT IN (SELECT customerId FROM Orders);
```

**Explanation:**
1. The subquery gets all customer IDs that appear in Orders.
2. The outer query filters Customers whose ID is not in that set.
3. Simple and readable for this use case.

**Note:** Be careful with `NOT IN` when the subquery might return NULL values. In this case, `customerId` is a foreign key, so it won't be NULL.

## Approach 2: LEFT JOIN with NULL check

```sql
SELECT c.name AS Customers
FROM Customers c
LEFT JOIN Orders o ON c.id = o.customerId
WHERE o.id IS NULL;
```

**Explanation:**
1. LEFT JOIN keeps all customers, even those without orders.
2. When a customer has no orders, the Orders columns will be NULL.
3. `WHERE o.id IS NULL` filters to only those customers.

This approach is generally preferred for performance on large datasets.

## Approach 3: NOT EXISTS

```sql
SELECT name AS Customers
FROM Customers c
WHERE NOT EXISTS (
    SELECT 1 FROM Orders o WHERE o.customerId = c.id
);
```

**Explanation:**
1. For each customer, check if any order exists with their ID.
2. `NOT EXISTS` returns true when the subquery returns no rows.
3. This approach handles NULLs correctly and can be very efficient.

## Key Insight

This is a classic "anti-join" pattern. LEFT JOIN with NULL check is often the most performant, but NOT IN and NOT EXISTS are equally valid for this problem.

# Editorial — Nth Highest Salary

## Problem Summary

Find the Nth highest distinct salary. Return NULL if it doesn't exist.

## Approach 1: DISTINCT + ORDER BY + OFFSET

```sql
SELECT DISTINCT salary AS getNthHighestSalary
FROM Employee
ORDER BY salary DESC
LIMIT 1 OFFSET 1;  -- For N=2, OFFSET = N-1
```

For a general N:
```sql
SELECT (
    SELECT DISTINCT salary
    FROM Employee
    ORDER BY salary DESC
    LIMIT 1 OFFSET N-1
) AS getNthHighestSalary;
```

**Explanation:**
1. Get distinct salaries ordered descending.
2. Skip the first N-1 rows (OFFSET N-1).
3. Take just 1 row (LIMIT 1).
4. Wrapping in a subquery ensures NULL is returned if N exceeds the number of distinct salaries.

## Approach 2: DENSE_RANK Window Function

```sql
SELECT salary AS getNthHighestSalary
FROM (
    SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
    FROM Employee
) ranked
WHERE rnk = 2  -- Replace with N
LIMIT 1;
```

**Explanation:**
1. DENSE_RANK assigns the same rank to duplicate salaries.
2. Filter for the Nth rank.

## Key Insight

The outer subquery wrapper is critical for returning NULL when no Nth salary exists. Without it, the query returns no rows instead of NULL.

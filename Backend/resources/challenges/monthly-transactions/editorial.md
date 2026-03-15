# Editorial — Monthly Transactions I

## Problem Summary

For each month-country combination, compute total transactions, approved transactions, total amount, and approved amount.

## Approach 1: GROUP BY with Conditional Aggregation

```sql
SELECT
    TO_CHAR(trans_date, 'YYYY-MM') AS month,
    country,
    COUNT(*) AS trans_count,
    SUM(CASE WHEN state = 'approved' THEN 1 ELSE 0 END) AS approved_count,
    SUM(amount) AS trans_total_amount,
    SUM(CASE WHEN state = 'approved' THEN amount ELSE 0 END) AS approved_total_amount
FROM Transactions
GROUP BY TO_CHAR(trans_date, 'YYYY-MM'), country;
```

**Explanation:**
1. Use `TO_CHAR(trans_date, 'YYYY-MM')` to extract year-month.
2. Group by month and country.
3. Use `CASE WHEN` inside aggregate functions to conditionally count/sum only approved transactions.

## Approach 2: Using FILTER (PostgreSQL specific)

```sql
SELECT
    TO_CHAR(trans_date, 'YYYY-MM') AS month,
    country,
    COUNT(*) AS trans_count,
    COUNT(*) FILTER (WHERE state = 'approved') AS approved_count,
    SUM(amount) AS trans_total_amount,
    COALESCE(SUM(amount) FILTER (WHERE state = 'approved'), 0) AS approved_total_amount
FROM Transactions
GROUP BY TO_CHAR(trans_date, 'YYYY-MM'), country;
```

## Key Insight

Conditional aggregation with `CASE WHEN` inside `SUM()` or `COUNT()` is the standard pattern for computing multiple aggregates with different filters in a single GROUP BY query.

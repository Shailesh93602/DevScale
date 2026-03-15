# Editorial — Investments in 2016

## Problem Summary

Sum tiv_2016 for policyholders where: (1) their tiv_2015 is shared by at least one other policyholder, and (2) their (lat, lon) is unique.

## Approach 1: Subqueries

```sql
SELECT ROUND(SUM(tiv_2016)::numeric, 2) AS tiv_2016
FROM Insurance
WHERE tiv_2015 IN (
    SELECT tiv_2015
    FROM Insurance
    GROUP BY tiv_2015
    HAVING COUNT(*) > 1
)
AND (lat, lon) IN (
    SELECT lat, lon
    FROM Insurance
    GROUP BY lat, lon
    HAVING COUNT(*) = 1
);
```

**Explanation:**
1. First subquery: finds tiv_2015 values shared by 2+ policyholders.
2. Second subquery: finds (lat, lon) pairs that appear exactly once.
3. Filter to policyholders meeting both conditions and sum their tiv_2016.

## Approach 2: Window Functions

```sql
SELECT ROUND(SUM(tiv_2016)::numeric, 2) AS tiv_2016
FROM (
    SELECT tiv_2016,
        COUNT(*) OVER (PARTITION BY tiv_2015) AS tiv_cnt,
        COUNT(*) OVER (PARTITION BY lat, lon) AS loc_cnt
    FROM Insurance
) sub
WHERE tiv_cnt > 1 AND loc_cnt = 1;
```

**Explanation:**
1. Window functions count how many share the same tiv_2015 and how many share the same location.
2. Filter for tiv_cnt > 1 (shared tiv_2015) and loc_cnt = 1 (unique location).

## Key Insight

The two conditions are independent: one about shared tiv_2015 values and one about unique locations. Both can be checked with GROUP BY/HAVING subqueries or window functions.

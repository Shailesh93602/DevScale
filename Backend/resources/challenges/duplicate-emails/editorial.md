# Editorial — Duplicate Emails

## Problem Summary

Find all emails that appear more than once in the Person table.

## Approach 1: GROUP BY with HAVING

```sql
SELECT email AS Email
FROM Person
GROUP BY email
HAVING COUNT(*) > 1;
```

**Explanation:**
1. Group rows by email.
2. Use HAVING to filter groups that have more than one row.
3. This is the most idiomatic SQL approach.

## Approach 2: Self Join

```sql
SELECT DISTINCT p1.email AS Email
FROM Person p1
JOIN Person p2 ON p1.email = p2.email AND p1.id <> p2.id;
```

**Explanation:**
1. Join the table with itself on matching emails but different IDs.
2. If a join match exists, the email is duplicated.
3. Use DISTINCT to avoid listing the same email multiple times.

## Approach 3: Subquery with COUNT

```sql
SELECT Email FROM (
    SELECT email AS Email, COUNT(*) AS cnt
    FROM Person
    GROUP BY email
) sub
WHERE cnt > 1;
```

## Key Insight

GROUP BY + HAVING is the standard pattern for finding duplicates. The HAVING clause filters after aggregation, making it perfect for "count > N" conditions.

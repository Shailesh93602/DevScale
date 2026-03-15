# Editorial — Delete Duplicate Emails

## Problem Summary

Delete all duplicate rows from the Person table based on the email column, keeping only the row with the smallest id for each unique email.

## Approach 1: Self Join DELETE

```sql
DELETE p1
FROM Person p1
INNER JOIN Person p2
ON p1.email = p2.email AND p1.id > p2.id;
```

**Explanation:**
1. Join the table with itself on matching emails.
2. The condition `p1.id > p2.id` ensures we only delete rows with a larger id.
3. For each duplicate pair, the one with the higher id gets deleted.

## Approach 2: DELETE with Subquery (PostgreSQL compatible)

```sql
DELETE FROM Person
WHERE id NOT IN (
    SELECT MIN(id)
    FROM Person
    GROUP BY email
);
```

**Explanation:**
1. The subquery finds the minimum id for each unique email.
2. The DELETE removes all rows whose id is not in that set of minimums.
3. This is the most portable and readable approach.

## Approach 3: Using CTE (PostgreSQL)

```sql
DELETE FROM Person
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn
        FROM Person
    ) sub
    WHERE rn > 1
);
```

**Explanation:**
1. Use ROW_NUMBER() to number rows within each email group, ordered by id.
2. Delete all rows where the row number is greater than 1 (i.e., duplicates).

## Key Insight

The key decision is which duplicate to keep. We keep the one with the smallest `id`. Both self-join and subquery approaches work well; the subquery approach is more intuitive for most SQL users.

# Editorial — Exchange Seats

## Problem Summary

Swap the seat id for every pair of consecutive students. Odd-numbered ids get id+1, even-numbered ids get id-1, and the last student (if total is odd) keeps their id.

## Approach 1: CASE WHEN

```sql
SELECT
    CASE
        WHEN id % 2 = 1 AND id = (SELECT MAX(id) FROM Seat) THEN id
        WHEN id % 2 = 1 THEN id + 1
        ELSE id - 1
    END AS id,
    student
FROM Seat
ORDER BY id;
```

**Explanation:**
1. If the id is odd and it's the last row (max id), keep it unchanged.
2. If the id is odd (but not the last), swap with the next: id + 1.
3. If the id is even, swap with the previous: id - 1.
4. Order by the new id.

## Approach 2: Window Functions (LEAD/LAG)

```sql
SELECT
    ROW_NUMBER() OVER (ORDER BY id) AS id,
    CASE
        WHEN id % 2 = 1 THEN COALESCE(LEAD(student) OVER (ORDER BY id), student)
        ELSE LAG(student) OVER (ORDER BY id)
    END AS student
FROM Seat;
```

**Explanation:**
1. For odd-numbered seats, take the next student (LEAD). If no next student exists (last odd row), keep the current student (COALESCE).
2. For even-numbered seats, take the previous student (LAG).

## Key Insight

The trick is handling the edge case where the total number of students is odd. The last student should not be swapped. The CASE WHEN approach handles this by checking if an odd id is the maximum id in the table.

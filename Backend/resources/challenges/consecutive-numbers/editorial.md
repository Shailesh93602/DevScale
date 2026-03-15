# Editorial — Consecutive Numbers

## Problem Summary

Find all numbers that appear at least three times consecutively in the Logs table, where consecutive means in adjacent `id` rows.

## Approach 1: Self Join

```sql
SELECT DISTINCT l1.num AS ConsecutiveNums
FROM Logs l1
JOIN Logs l2 ON l1.id = l2.id - 1
JOIN Logs l3 ON l2.id = l3.id - 1
WHERE l1.num = l2.num AND l2.num = l3.num;
```

**Explanation:**
1. Join the table with itself three times on consecutive IDs.
2. `l1.id = l2.id - 1` ensures l2 is the row right after l1.
3. `l2.id = l3.id - 1` ensures l3 is the row right after l2.
4. The WHERE clause checks all three rows have the same number.
5. `DISTINCT` ensures each number appears only once in the result.

**Complexity:** O(n) with proper indexing on id.

## Approach 2: Window Functions (LAG/LEAD)

```sql
SELECT DISTINCT num AS ConsecutiveNums
FROM (
    SELECT
        num,
        LAG(num, 1) OVER (ORDER BY id) AS prev_num,
        LEAD(num, 1) OVER (ORDER BY id) AS next_num
    FROM Logs
) sub
WHERE num = prev_num AND num = next_num;
```

**Explanation:**
1. Use `LAG` to get the previous row's num and `LEAD` to get the next row's num.
2. A number appears consecutively 3 times if the current, previous, and next values are all the same.
3. `DISTINCT` removes duplicates (e.g., if a number appears 4+ times consecutively).

## Key Insight

The self-join approach is straightforward — join three copies of the table on consecutive IDs. The window function approach is more elegant and generalizes well if you need to check for N consecutive occurrences.

# Editorial — Students Unable to Eat Lunch

## Problem Summary

Count how many students cannot eat given their sandwich preferences and the available sandwich stack. A student cannot eat when there are no sandwiches of their preferred type remaining.

## Approach 1: Count Mismatch

The key insight is that the order of students doesn't matter — only the counts matter. If there are enough sandwiches of each type to match the number of students who prefer that type, everyone eats. The surplus students of one type who don't have matching sandwiches are the ones who can't eat.

```sql
SELECT
    GREATEST(
        (SELECT COUNT(*) FROM Students WHERE preference = 0) -
        (SELECT COUNT(*) FROM Sandwiches WHERE type = 0),
        0
    ) +
    GREATEST(
        (SELECT COUNT(*) FROM Students WHERE preference = 1) -
        (SELECT COUNT(*) FROM Sandwiches WHERE type = 1),
        0
    ) AS count;
```

**Explanation:**
1. Count students preferring type 0 and sandwiches of type 0.
2. Count students preferring type 1 and sandwiches of type 1.
3. For each type, if students exceed sandwiches, those extra students can't eat.
4. Sum the shortages.

## Approach 2: Using CASE and Aggregation

```sql
WITH student_counts AS (
    SELECT preference, COUNT(*) AS cnt
    FROM Students
    GROUP BY preference
),
sandwich_counts AS (
    SELECT type, COUNT(*) AS cnt
    FROM Sandwiches
    GROUP BY type
)
SELECT COALESCE(SUM(
    CASE WHEN sc.cnt > COALESCE(wc.cnt, 0) THEN sc.cnt - COALESCE(wc.cnt, 0) ELSE 0 END
), 0) AS count
FROM student_counts sc
LEFT JOIN sandwich_counts wc ON sc.preference = wc.type;
```

## Key Insight

The order students stand in the queue is irrelevant for determining how many can't eat. What matters is whether the total count of each sandwich type matches or exceeds the number of students who prefer that type.

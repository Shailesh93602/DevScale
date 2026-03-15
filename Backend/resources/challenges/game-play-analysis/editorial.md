# Editorial — Game Play Analysis I

## Problem Summary

Find the first login date for each player by finding the minimum event_date per player.

## Approach 1: GROUP BY with MIN

```sql
SELECT player_id, MIN(event_date) AS first_login
FROM Activity
GROUP BY player_id;
```

**Explanation:**
1. Group rows by player_id.
2. Use MIN(event_date) to find the earliest login date for each player.

This is the simplest and most efficient approach.

## Approach 2: Window Function

```sql
SELECT DISTINCT player_id,
    FIRST_VALUE(event_date) OVER (PARTITION BY player_id ORDER BY event_date) AS first_login
FROM Activity;
```

**Explanation:**
1. FIRST_VALUE returns the first event_date for each player when ordered by date.
2. DISTINCT removes duplicate rows since each player may have multiple activity rows.

## Key Insight

This is a straightforward GROUP BY + MIN aggregation problem. No joins or subqueries are needed.

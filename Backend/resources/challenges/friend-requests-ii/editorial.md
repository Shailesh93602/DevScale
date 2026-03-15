# Editorial — Friend Requests II: Who Has the Most Friends

## Problem Summary

Find the person with the most friends. Friendship is bidirectional — each accepted request creates a friend relationship from both sides.

## Approach 1: UNION ALL with Aggregation

```sql
SELECT id, COUNT(*) AS num
FROM (
    SELECT requester_id AS id FROM RequestAccepted
    UNION ALL
    SELECT accepter_id AS id FROM RequestAccepted
) all_friends
GROUP BY id
ORDER BY num DESC
LIMIT 1;
```

**Explanation:**
1. UNION ALL combines all requester_ids and accepter_ids into one column.
2. Each accepted request contributes one friend to each person, so we need both sides.
3. Group by person id and count their total friends.
4. Order by count descending and take the top one.

## Approach 2: CTE with UNION ALL

```sql
WITH friends AS (
    SELECT requester_id AS id FROM RequestAccepted
    UNION ALL
    SELECT accepter_id AS id FROM RequestAccepted
)
SELECT id, COUNT(*) AS num
FROM friends
GROUP BY id
ORDER BY num DESC
LIMIT 1;
```

Same logic, but uses a CTE for better readability.

## Key Insight

Friendship is bidirectional. Each row `(requester_id, accepter_id)` means both people gain a friend. Using UNION ALL (not UNION) to combine both columns ensures each friendship is counted for both people. We use UNION ALL instead of UNION because each appearance represents a distinct friendship.

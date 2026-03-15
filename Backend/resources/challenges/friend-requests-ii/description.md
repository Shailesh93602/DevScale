# Friend Requests II: Who Has the Most Friends

## Table Schema

```sql
CREATE TABLE RequestAccepted (
    requester_id INT,
    accepter_id INT,
    accept_date DATE,
    PRIMARY KEY (requester_id, accepter_id)
);
```

`(requester_id, accepter_id)` is the primary key. Each row contains the IDs of two users who accepted a friend request and the date it was accepted.

## Problem Statement

Write a SQL query to find the people who have the most friends and the most friends number.

The test cases guarantee only one person has the most friends.

Return the result with columns `id` and `num`.

## Example 1

**Input:**

RequestAccepted table:
| requester_id | accepter_id | accept_date |
|--------------|-------------|-------------|
| 1            | 2           | 2016-06-03  |
| 1            | 3           | 2016-06-08  |
| 2            | 3           | 2016-06-08  |
| 3            | 4           | 2016-06-09  |

**Output:**

| id | num |
|----|-----|
| 3  | 3   |

**Explanation:**
- Person 1 has 2 friends (2, 3)
- Person 2 has 2 friends (1, 3)
- Person 3 has 3 friends (1, 2, 4)
- Person 4 has 1 friend (3)

Person 3 has the most friends.

## Constraints

- Friendship is bidirectional: if (1, 2) is in the table, person 1 and person 2 are friends.
- The test cases guarantee exactly one person has the maximum friend count.

# Exchange Seats

## Table Schema

```sql
CREATE TABLE Seat (
    id SERIAL PRIMARY KEY,
    student VARCHAR(255)
);
```

`id` is a continuous auto-increment column starting from 1.

## Problem Statement

Write a SQL query to swap the seat id of every two consecutive students. If the number of students is odd, the id of the last student is not swapped.

Return the result table ordered by `id` in ascending order.

## Example 1

**Input:**

Seat table:
| id | student |
|----|---------|
| 1  | Abbot   |
| 2  | Doris   |
| 3  | Emerson |
| 4  | Green   |
| 5  | Jeames  |

**Output:**

| id | student |
|----|---------|
| 1  | Doris   |
| 2  | Abbot   |
| 3  | Green   |
| 4  | Emerson |
| 5  | Jeames  |

**Explanation:** Students in seats 1 and 2 swap, students in seats 3 and 4 swap. Student in seat 5 stays because there is no seat 6 to swap with.

## Example 2

**Input:**

Seat table:
| id | student |
|----|---------|
| 1  | Alice   |
| 2  | Bob     |

**Output:**

| id | student |
|----|---------|
| 1  | Bob     |
| 2  | Alice   |

## Constraints

- The table has at least 1 row.
- `id` is continuous starting from 1.

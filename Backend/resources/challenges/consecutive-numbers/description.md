# Consecutive Numbers

## Table Schema

```sql
CREATE TABLE Logs (
    id SERIAL PRIMARY KEY,
    num VARCHAR(50)
);
```

`id` is the primary key and an auto-increment column.

## Problem Statement

Find all numbers that appear at least three times consecutively.

Return the result table with the column name `ConsecutiveNums`. Return the result in **any order**.

## Example 1

**Input:**

Logs table:
| id | num |
|----|-----|
| 1  | 1   |
| 2  | 1   |
| 3  | 1   |
| 4  | 2   |
| 5  | 1   |
| 6  | 2   |
| 7  | 2   |

**Output:**

| ConsecutiveNums |
|-----------------|
| 1               |

**Explanation:** 1 is the only number that appears consecutively for at least three times (rows 1, 2, 3).

## Example 2

**Input:**

Logs table:
| id | num |
|----|-----|
| 1  | 1   |
| 2  | 2   |
| 3  | 1   |
| 4  | 1   |

**Output:**

| ConsecutiveNums |
|-----------------|

(Empty result - no number appears three times consecutively.)

## Constraints

- The table can have up to 10^6 rows.
- `id` starts from 1 and auto-increments.

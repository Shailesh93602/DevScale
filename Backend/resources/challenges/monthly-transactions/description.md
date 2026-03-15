# Monthly Transactions I

## Table Schema

```sql
CREATE TABLE Transactions (
    id INT PRIMARY KEY,
    country VARCHAR(4),
    state VARCHAR(10),  -- 'approved' or 'declined'
    amount INT,
    trans_date DATE
);
```

## Problem Statement

Write a SQL query to find for each month and country, the number of transactions and their total amount, the number of approved transactions and their total amount.

Return the result table with columns: `month`, `country`, `trans_count`, `approved_count`, `trans_total_amount`, `approved_total_amount`.

The `month` column should be in `YYYY-MM` format.

## Example 1

**Input:**

Transactions table:
| id  | country | state    | amount | trans_date |
|-----|---------|----------|--------|------------|
| 121 | US      | approved | 1000   | 2018-12-18 |
| 122 | US      | declined | 2000   | 2018-12-19 |
| 123 | US      | approved | 2000   | 2019-01-01 |
| 124 | DE      | approved | 2000   | 2019-01-07 |

**Output:**

| month   | country | trans_count | approved_count | trans_total_amount | approved_total_amount |
|---------|---------|-------------|----------------|--------------------|-----------------------|
| 2018-12 | US      | 2           | 1              | 3000               | 1000                  |
| 2019-01 | US      | 1           | 1              | 2000               | 2000                  |
| 2019-01 | DE      | 1           | 1              | 2000               | 2000                  |

## Constraints

- The table can have up to 10^5 rows.
- `state` is either 'approved' or 'declined'.

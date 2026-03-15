# Find Customers With Positive Revenue

## Table Schema

```sql
CREATE TABLE Customers (
    customer_id INT,
    year INT,
    revenue INT,
    PRIMARY KEY (customer_id, year)
);
```

`(customer_id, year)` is the primary key. Each row contains the customer ID, the year, and the revenue for that customer in that year. Revenue can be negative (refunds/losses).

## Problem Statement

Write a SQL query to find customers whose **total revenue** across all years is strictly positive (greater than 0).

Return the result table with column `customer_id` in **any order**.

## Example 1

**Input:**

Customers table:
| customer_id | year | revenue |
|-------------|------|---------|
| 1           | 2018 | 50      |
| 1           | 2019 | -10     |
| 2           | 2018 | -20     |
| 2           | 2019 | -30     |
| 3           | 2018 | 100     |

**Output:**

| customer_id |
|-------------|
| 1           |
| 3           |

**Explanation:** Customer 1 has total revenue 50 + (-10) = 40 > 0. Customer 2 has total revenue -20 + (-30) = -50 < 0. Customer 3 has total revenue 100 > 0.

## Constraints

- The table can have up to 10^5 rows.
- Revenue can be negative, zero, or positive.

# Product Sales Analysis I

## Table Schema

```sql
CREATE TABLE Sales (
    sale_id INT,
    product_id INT REFERENCES Product(product_id),
    year INT,
    quantity INT,
    price INT,
    PRIMARY KEY (sale_id, year)
);

CREATE TABLE Product (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(255)
);
```

## Problem Statement

Write a SQL query that reports the `product_name`, `year`, and `price` for each `sale_id` in the Sales table.

Return the result table in **any order**.

## Example 1

**Input:**

Sales table:
| sale_id | product_id | year | quantity | price |
|---------|------------|------|----------|-------|
| 1       | 100        | 2008 | 10       | 5000  |
| 2       | 100        | 2009 | 12       | 5000  |
| 7       | 200        | 2011 | 15       | 9000  |

Product table:
| product_id | product_name |
|------------|--------------|
| 100        | Nokia        |
| 200        | Apple        |
| 300        | Samsung      |

**Output:**

| product_name | year | price |
|--------------|------|-------|
| Nokia        | 2008 | 5000  |
| Nokia        | 2009 | 5000  |
| Apple        | 2011 | 9000  |

## Constraints

- Each sale has a valid product_id.
- The table can have up to 10^5 rows.

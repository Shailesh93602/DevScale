# Immediate Food Delivery II

## Table Schema

```sql
CREATE TABLE Delivery (
    delivery_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    customer_pref_delivery_date DATE
);
```

If the customer's preferred delivery date is the same as the order date, then the order is called **immediate**; otherwise, it is called **scheduled**.

The **first order** of a customer is the order with the earliest order date that the customer made. It is guaranteed that a customer has exactly one first order.

## Problem Statement

Write a SQL query to find the percentage of immediate orders in the first orders of all customers, rounded to 2 decimal places.

## Example 1

**Input:**

Delivery table:
| delivery_id | customer_id | order_date | customer_pref_delivery_date |
|-------------|-------------|------------|-----------------------------|
| 1           | 1           | 2019-08-01 | 2019-08-02                  |
| 2           | 2           | 2019-08-02 | 2019-08-02                  |
| 3           | 1           | 2019-08-11 | 2019-08-12                  |
| 4           | 3           | 2019-08-24 | 2019-08-24                  |
| 5           | 3           | 2019-08-21 | 2019-08-22                  |
| 6           | 2           | 2019-08-11 | 2019-08-13                  |
| 7           | 4           | 2019-08-09 | 2019-08-09                  |

**Output:**

| immediate_percentage |
|----------------------|
| 50.00                |

**Explanation:**
- Customer 1: first order is delivery_id 1, scheduled (08-01 != 08-02)
- Customer 2: first order is delivery_id 2, immediate (08-02 = 08-02)
- Customer 3: first order is delivery_id 5 (08-21 < 08-24), scheduled
- Customer 4: first order is delivery_id 7, immediate (08-09 = 08-09)
- 2 out of 4 first orders are immediate = 50.00%

## Constraints

- The table can have up to 10^5 rows.
- Each customer has exactly one first order (earliest order_date is unique per customer).

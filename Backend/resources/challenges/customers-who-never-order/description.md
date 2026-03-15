# Customers Who Never Order

## Table Schema

```sql
CREATE TABLE Customers (
    id INT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE Orders (
    id INT PRIMARY KEY,
    customerId INT REFERENCES Customers(id)
);
```

## Problem Statement

Write a SQL query to find all customers who never order anything.

Return the result table with the column name `Customers`.

## Example 1

**Input:**

Customers table:
| id | name  |
|----|-------|
| 1  | Joe   |
| 2  | Henry |
| 3  | Sam   |
| 4  | Max   |

Orders table:
| id | customerId |
|----|------------|
| 1  | 3          |
| 2  | 1          |

**Output:**

| Customers |
|-----------|
| Henry     |
| Max       |

**Explanation:** Henry (id=2) and Max (id=4) never placed any orders.

## Constraints

- 1 <= Customers.id <= 10^4
- 1 <= Orders.id <= 10^4
- `customerId` in Orders is a foreign key referencing `Customers.id`.

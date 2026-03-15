# Employees Earning More Than Their Managers

## Table Schema

```sql
CREATE TABLE Employee (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    salary INT,
    managerId INT REFERENCES Employee(id)
);
```

Each row indicates the ID, name, salary, and manager of an employee. If `managerId` is NULL, the employee does not have a manager.

## Problem Statement

Write a SQL query to find the employees who earn more than their managers.

Return the result table with the column name `Employee`.

## Example 1

**Input:**

Employee table:
| id | name  | salary | managerId |
|----|-------|--------|-----------|
| 1  | Joe   | 70000  | 3         |
| 2  | Henry | 80000  | 4         |
| 3  | Sam   | 60000  | NULL      |
| 4  | Max   | 90000  | NULL      |

**Output:**

| Employee |
|----------|
| Joe      |

**Explanation:** Joe earns 70000 and his manager Sam earns 60000, so Joe earns more than his manager. Henry earns 80000 but his manager Max earns 90000.

## Example 2

**Input:**

Employee table:
| id | name  | salary | managerId |
|----|-------|--------|-----------|
| 1  | Alice | 50000  | 2         |
| 2  | Bob   | 60000  | NULL      |

**Output:**

| Employee |
|----------|

(Empty result - Alice earns less than her manager Bob.)

## Constraints

- The table can have up to 10^4 rows.
- Salary is a non-negative integer.
- No circular manager references.

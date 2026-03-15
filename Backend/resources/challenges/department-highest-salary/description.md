# Department Highest Salary

## Table Schema

```sql
CREATE TABLE Employee (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    salary INT,
    departmentId INT REFERENCES Department(id)
);

CREATE TABLE Department (
    id INT PRIMARY KEY,
    name VARCHAR(255)
);
```

## Problem Statement

Write a SQL query to find employees who have the highest salary in each of the departments.

Return the result table with columns `Department`, `Employee`, and `Salary` in **any order**.

If multiple employees have the same highest salary in a department, return all of them.

## Example 1

**Input:**

Employee table:
| id | name  | salary | departmentId |
|----|-------|--------|--------------|
| 1  | Joe   | 70000  | 1            |
| 2  | Jim   | 90000  | 1            |
| 3  | Henry | 80000  | 2            |
| 4  | Sam   | 60000  | 2            |
| 5  | Max   | 90000  | 1            |

Department table:
| id | name  |
|----|-------|
| 1  | IT    |
| 2  | Sales |

**Output:**

| Department | Employee | Salary |
|------------|----------|--------|
| IT         | Jim      | 90000  |
| IT         | Max      | 90000  |
| Sales      | Henry    | 80000  |

**Explanation:** Jim and Max both have the highest salary in IT. Henry has the highest salary in Sales.

## Constraints

- The table can have up to 10^4 rows.
- Salary is a non-negative integer.

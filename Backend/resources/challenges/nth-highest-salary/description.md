# Nth Highest Salary

## Table Schema

```sql
CREATE TABLE Employee (
    id INT PRIMARY KEY,
    salary INT
);
```

## Problem Statement

Write a SQL query to find the **Nth highest distinct salary** from the Employee table. If there are fewer than N distinct salaries, return `NULL`.

For this problem, assume N = 2 in the examples, but your solution should work for any value of N.

## Example 1

**Input:**

Employee table:
| id | salary |
|----|--------|
| 1  | 100    |
| 2  | 200    |
| 3  | 300    |

N = 2

**Output:**

| getNthHighestSalary(2) |
|------------------------|
| 200                    |

**Explanation:** The 2nd highest distinct salary is 200.

## Example 2

**Input:**

Employee table:
| id | salary |
|----|--------|
| 1  | 100    |

N = 2

**Output:**

| getNthHighestSalary(2) |
|------------------------|
| NULL                   |

**Explanation:** Only one distinct salary exists, so 2nd highest is NULL.

## Constraints

- 1 <= N
- Salary can have duplicate values across employees.
- Return NULL if there is no Nth highest salary.

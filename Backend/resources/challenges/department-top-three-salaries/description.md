# Department Top Three Salaries

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

A company's executives are interested in seeing who earns the most in each department. A **high earner** in a department is an employee who has a salary in the **top three unique** salaries for that department.

Write a SQL query to find the employees who are high earners in each of the departments.

Return the result table with columns `Department`, `Employee`, and `Salary` in **any order**.

## Example 1

**Input:**

Employee table:
| id | name  | salary | departmentId |
|----|-------|--------|--------------|
| 1  | Joe   | 85000  | 1            |
| 2  | Henry | 80000  | 2            |
| 3  | Sam   | 60000  | 2            |
| 4  | Max   | 90000  | 1            |
| 5  | Janet | 69000  | 1            |
| 6  | Randy | 85000  | 1            |
| 7  | Will  | 70000  | 1            |

Department table:
| id | name  |
|----|-------|
| 1  | IT    |
| 2  | Sales |

**Output:**

| Department | Employee | Salary |
|------------|----------|--------|
| IT         | Max      | 90000  |
| IT         | Joe      | 85000  |
| IT         | Randy    | 85000  |
| IT         | Will     | 70000  |
| Sales      | Henry    | 80000  |
| Sales      | Sam      | 60000  |

**Explanation:**
- In IT: Max (90000), Joe and Randy (85000), and Will (70000) are the top 3 unique salaries. Janet (69000) is 4th.
- In Sales: Only two employees, both are included.

## Constraints

- The table can have up to 10^4 rows.
- Salary is a non-negative integer.
- "Top three unique salaries" means the three highest distinct salary values.

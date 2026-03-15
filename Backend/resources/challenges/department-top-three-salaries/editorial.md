# Editorial — Department Top Three Salaries

## Problem Summary

Find employees whose salary is among the top 3 unique (distinct) salaries in their department.

## Approach 1: DENSE_RANK Window Function

```sql
SELECT Department, Employee, Salary
FROM (
    SELECT
        d.name AS Department,
        e.name AS Employee,
        e.salary AS Salary,
        DENSE_RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) AS rnk
    FROM Employee e
    JOIN Department d ON e.departmentId = d.id
) ranked
WHERE rnk <= 3;
```

**Explanation:**
1. Join Employee with Department.
2. Use DENSE_RANK() to rank employees within each department by salary descending.
3. DENSE_RANK() handles ties correctly — employees with the same salary get the same rank, and the next distinct salary gets the next rank (no gaps).
4. Filter to rank <= 3 to get the top 3 unique salaries.

**Why DENSE_RANK and not RANK or ROW_NUMBER?**
- DENSE_RANK: 90000=1, 85000=2, 70000=3, 69000=4 (no gaps)
- RANK: 90000=1, 85000=2, 85000=2, 70000=4 (gaps after ties)
- ROW_NUMBER: 90000=1, 85000=2, 85000=3, 70000=4 (arbitrary tie-breaking)

We need DENSE_RANK because "top 3 unique salaries" means the 3 highest distinct values.

## Approach 2: Correlated Subquery

```sql
SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary
FROM Employee e
JOIN Department d ON e.departmentId = d.id
WHERE (
    SELECT COUNT(DISTINCT e2.salary)
    FROM Employee e2
    WHERE e2.departmentId = e.departmentId AND e2.salary > e.salary
) < 3;
```

**Explanation:**
1. For each employee, count how many distinct salaries in their department are higher than theirs.
2. If fewer than 3 salaries are higher, the employee is in the top 3.

This approach is less efficient but demonstrates the logic clearly.

## Key Insight

DENSE_RANK is the ideal window function for "top N unique values" problems. It assigns the same rank to equal values and increments by 1 for the next distinct value, which is exactly what "top 3 unique salaries" requires.

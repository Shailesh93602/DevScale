# Editorial — Department Highest Salary

## Problem Summary

Find the employee(s) with the highest salary in each department. Multiple employees can share the top salary in a department.

## Approach 1: Subquery with IN

```sql
SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary
FROM Employee e
JOIN Department d ON e.departmentId = d.id
WHERE (e.departmentId, e.salary) IN (
    SELECT departmentId, MAX(salary)
    FROM Employee
    GROUP BY departmentId
);
```

**Explanation:**
1. The subquery finds the maximum salary for each department.
2. The outer query joins Employee with Department and filters to only those employees whose (departmentId, salary) pair matches the max.
3. This naturally handles ties — multiple employees with the same max salary are all returned.

## Approach 2: Window Function

```sql
SELECT Department, Employee, Salary
FROM (
    SELECT
        d.name AS Department,
        e.name AS Employee,
        e.salary AS Salary,
        RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) AS rnk
    FROM Employee e
    JOIN Department d ON e.departmentId = d.id
) ranked
WHERE rnk = 1;
```

**Explanation:**
1. Use RANK() to rank employees within each department by salary descending.
2. RANK() assigns the same rank to tied values, so all employees with the highest salary get rank 1.
3. Filter to only rank 1.

## Key Insight

Use RANK() instead of ROW_NUMBER() when there might be ties. RANK() gives the same rank to tied values, while ROW_NUMBER() would arbitrarily break ties.

# Editorial — Employees Earning More Than Their Managers

## Problem Summary

Find employees whose salary exceeds their manager's salary by joining the Employee table with itself.

## Approach 1: Self Join

```sql
SELECT e.name AS Employee
FROM Employee e
JOIN Employee m ON e.managerId = m.id
WHERE e.salary > m.salary;
```

**Explanation:**
1. Alias the Employee table as `e` (employee) and `m` (manager).
2. Join on `e.managerId = m.id` to link each employee to their manager.
3. Filter where the employee's salary exceeds the manager's salary.
4. Employees without managers (managerId = NULL) are excluded by the INNER JOIN.

## Approach 2: Subquery

```sql
SELECT e.name AS Employee
FROM Employee e
WHERE e.salary > (
    SELECT m.salary
    FROM Employee m
    WHERE m.id = e.managerId
);
```

**Explanation:**
1. For each employee, find their manager's salary via a correlated subquery.
2. Filter employees whose salary is greater.
3. If managerId is NULL, the subquery returns NULL, and the comparison is false.

## Key Insight

This is a classic self-join problem. The Employee table references itself through the `managerId` column. Joining the table with itself lets you compare an employee's data with their manager's data in the same row.

# Editorial — Second Highest Salary

### Approach 1: Subquery with MAX()
One way to find the second highest salary is to find the maximum salary that is strictly less than the overall maximum salary.

```sql
SELECT MAX(salary) AS SecondHighestSalary
FROM Employee
WHERE salary < (SELECT MAX(salary) FROM Employee);
```

### Approach 2: LIMIT and OFFSET
Alternatively, we can sort the distinct salaries in descending order and skip the first one.

```sql
SELECT (
  SELECT DISTINCT salary
  FROM Employee
  ORDER BY salary DESC
  LIMIT 1 OFFSET 1
) AS SecondHighestSalary;
```

**Why the outer SELECT?**
If there is no second highest salary (e.g., only one employee or all employees have the same salary), the inner query will return nothing. By wrapping it in a `SELECT ( ... )`, SQL will return `NULL` as the result, which matches the problem requirements.

**Complexity**
- Time: $O(N \log N)$ for sorting, or $O(N)$ for Approach 1.
- Space: $O(N)$ for sorting.

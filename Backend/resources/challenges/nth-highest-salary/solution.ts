// Optimal SQL Solution (for N=2; replace OFFSET value for general N)
const solution = `
SELECT (
    SELECT DISTINCT salary
    FROM Employee
    ORDER BY salary DESC
    LIMIT 1 OFFSET 1
) AS getNthHighestSalary;
`;

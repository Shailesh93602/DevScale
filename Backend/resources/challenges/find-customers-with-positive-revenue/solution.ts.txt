// Optimal SQL Solution
const solution = `
SELECT customer_id
FROM Customers
GROUP BY customer_id
HAVING SUM(revenue) > 0;
`;

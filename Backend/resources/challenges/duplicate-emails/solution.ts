// Optimal SQL Solution
const solution = `
SELECT email AS Email
FROM Person
GROUP BY email
HAVING COUNT(*) > 1;
`;

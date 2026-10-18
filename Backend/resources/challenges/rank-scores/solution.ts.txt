// Optimal SQL Solution
const solution = `
SELECT
    score,
    DENSE_RANK() OVER (ORDER BY score DESC) AS 'rank'
FROM Scores
ORDER BY score DESC;
`;

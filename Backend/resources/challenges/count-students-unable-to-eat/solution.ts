// Optimal SQL Solution
const solution = `
SELECT
    GREATEST(
        (SELECT COUNT(*) FROM Students WHERE preference = 0) -
        (SELECT COUNT(*) FROM Sandwiches WHERE type = 0),
        0
    ) +
    GREATEST(
        (SELECT COUNT(*) FROM Students WHERE preference = 1) -
        (SELECT COUNT(*) FROM Sandwiches WHERE type = 1),
        0
    ) AS count;
`;

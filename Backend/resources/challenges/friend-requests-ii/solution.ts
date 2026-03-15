// Optimal SQL Solution
const solution = `
SELECT id, COUNT(*) AS num
FROM (
    SELECT requester_id AS id FROM RequestAccepted
    UNION ALL
    SELECT accepter_id AS id FROM RequestAccepted
) all_friends
GROUP BY id
ORDER BY num DESC
LIMIT 1;
`;

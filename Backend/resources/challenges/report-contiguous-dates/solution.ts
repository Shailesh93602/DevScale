// Optimal SQL Solution
const solution = `
WITH AllDates AS (
    SELECT fail_date AS res_date, 'failed' AS state
    FROM Failed
    WHERE fail_date BETWEEN '2019-01-01' AND '2019-12-31'
    UNION ALL
    SELECT success_date AS res_date, 'succeeded' AS state
    FROM Succeeded
    WHERE success_date BETWEEN '2019-01-01' AND '2019-12-31'
),
Groups AS (
    SELECT
        res_date,
        state,
        -- Subtracting row numbers per state from the date creates a constant value for contiguous dates
        DATEADD(day, -ROW_NUMBER() OVER(PARTITION BY state ORDER BY res_date), res_date) AS grp
    FROM AllDates
)
SELECT
    state AS period_state,
    MIN(res_date) AS start_date,
    MAX(res_date) AS end_date
FROM Groups
GROUP BY state, grp
ORDER BY start_date;
`;

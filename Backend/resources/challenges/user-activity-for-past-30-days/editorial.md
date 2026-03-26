# Editorial — User Activity for the Past 30 Days I

### Logic
The problem asks for the single most common metric in analytics: **Daily Active Users (DAU)**.

1.  **Filter**: We only care about activities within a 30-day window ending on 2019-07-27. This means the range is `['2019-06-28', '2019-07-27']`.
2.  **Grouping**: We want the count *per day*, so we group by `activity_date`.
3.  **Aggregation**: A single user can perform multiple actions (clicks, views, etc.) in a single day. To get the unique count of users, we use `COUNT(DISTINCT user_id)`.

### SQL Implementation
```sql
SELECT
    activity_date AS day,
    COUNT(DISTINCT user_id) AS active_users
FROM Activity
WHERE activity_date BETWEEN '2019-06-28' AND '2019-07-27'
GROUP BY activity_date;
```

**Complexity**
- Time: $O(N \log N)$ or $O(N)$ depending on if an index exists on `activity_date`.
- Space: $O(K)$ where $K$ is the number of distinct days in the result.


# Editorial — Restaurant Growth

### Approach: Window Functions
This problem is a classic application of SQL window functions. We need to sum and average data over a rolling time window.

1. **Preprocessing**: 
   Since multiple customers can visit on the same day, we first need to aggregate the total amount per day.
   ```sql
   DailyTotals AS (
     SELECT visited_on, SUM(amount) AS day_amount
     FROM Customer
     GROUP BY visited_on
   )
   ```

2. **Moving Window Calculation**:
   We use `SUM()` and `AVG()` as window functions. The frame of the window is `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW`, which totals 7 rows (7 days).
   ```sql
   SUM(day_amount) OVER (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)
   ```

3. **Filtering**:
   The problem implies we only want results starting from the 7th day of the available dataset (where a full 7-day window exists). We can use `ROW_NUMBER()` or simply count the days.

**Query Breakdown**
Using `WITH` clauses makes the query much more readable.

**Complexity**
- Time: $O(N \log N)$ for sorting the dates.
- Space: $O(N)$ for intermediate tables.

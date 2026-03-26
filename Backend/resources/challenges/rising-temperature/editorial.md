# Editorial — Rising Temperature

### Approach: Self-Join with DATEDIFF
To find the days where the temperature was higher than the previous day, we must compare each record with every other record that has a date exactly one day prior.

We can achieve this by joining the `Weather` table with itself.

**Algorithm**
1. Join `Weather w1` with `Weather w2`.
2. The join condition is `DATEDIFF(w1.recordDate, w2.recordDate) = 1`. This ensures `w2` represents "yesterday" relative to `w1`.
3. Filter the rows where `w1.temperature > w2.temperature`.
4. Select `w1.id`.

**SQL Query**
```sql
SELECT w1.id
FROM Weather w1
JOIN Weather w2 ON DATEDIFF(w1.recordDate, w2.recordDate) = 1
WHERE w1.temperature > w2.temperature;
```

**Complexity**
- Time: $O(N^2)$ in the worst case without indexes, but $O(N)$ or $O(N \log N)$ with proper indexing on `recordDate`.
- Space: $O(N)$ for the result.

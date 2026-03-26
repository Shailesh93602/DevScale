# Editorial — Report Contiguous Dates

### The Gaps and Islands Problem
This is a classic "Gaps and Islands" SQL problem. We need to identify continuous "islands" of dates that share the same state.

### Strategy: The Row Number Difference
The most powerful technique for this is to generate two sequences of numbers:
1.  **Global Sequence**: A row number ordered by date.
2.  **State Sequence**: A row number ordered by date but partitioned by state.

If you subtract the **State Sequence** from the **Global Sequence** (or from the actual date), the result will be a constant value for any contiguous block of dates within that state.

**Example**:
| date | state | row_num (state) | date - row_num |
| :--- | :--- | :--- | :--- |
| Jan 1 | failed | 1 | Dec 31 |
| Jan 2 | failed | 2 | Dec 31 |
| Jan 4 | failed | 3 | Jan 1 |
| Jan 5 | failed | 4 | Jan 1 |

Notice how `Jan 1` and `Jan 2` both result in `Dec 31`. This constant value can be used in a `GROUP BY` clause to combine the rows into a single period.

### Implementation Steps
1.  **Union**: Combine the `Failed` and `Succeeded` tables into one `AllDates` table, filtering for the year 2019.
2.  **Window Function**: Apply `ROW_NUMBER() OVER(PARTITION BY state ORDER BY date)` to each row.
3.  **Group By**: Group by both the `state` and the calculated `date - row_num`.
4.  **Aggregate**: Select the `MIN(date)` as `start_date` and `MAX(date)` as `end_date`.

### Complexity Analysis
- **Time Complexity**: $O(N \log N)$ where $N$ is the total number of dates, due to the sorting required for window functions and union operations.
- **Space Complexity**: $O(N)$ for storing intermediate results.


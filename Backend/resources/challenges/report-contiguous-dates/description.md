# Report Contiguous Dates

A system logs failed and succeeded tasks in two separate tables. Write a solution to report the period of time in 2019 where tasks had the same status (`'failed'` or `'succeeded'`) continuously.

The result table should contain `period_state`, `start_date`, and `end_date`.

- `period_state` is the status of the tasks during that period.
- `start_date` is the first date of that period.
- `end_date` is the last date of that period.

Return the result table ordered by `start_date`.

### Table: Failed
| Column Name | Type |
| :--- | :--- |
| fail_date | date |

`fail_date` is the primary key for this table.
This table contains the days of failed tasks.

### Table: Succeeded
| Column Name | Type |
| :--- | :--- |
| success_date | date |

`success_date` is the primary key for this table.
This table contains the days of succeeded tasks.

### Example 1:
**Input:**
Failed table:
| fail_date |
| :--- |
| 2018-12-28 |
| 2018-12-29 |
| 2019-01-04 |
| 2019-01-05 |

Succeeded table:
| success_date |
| :--- |
| 2018-12-30 |
| 2018-12-31 |
| 2019-01-01 |
| 2019-01-02 |
| 2019-01-03 |
| 2019-01-06 |

**Output:**
| period_state | start_date | end_date |
| :--- | :--- | :--- |
| succeeded | 2019-01-01 | 2019-01-03 |
| failed | 2019-01-04 | 2019-01-05 |
| succeeded | 2019-01-06 | 2019-01-06 |

**Explanation:**
- The tasks succeeded from 2018-12-30 to 2019-01-03. However, we only care about 2019, so the period is 2019-01-01 to 2019-01-03.
- The tasks failed on 2019-01-04 and 2019-01-05, so the period is 2019-01-04 to 2019-01-05.
- The tasks succeeded on 2019-01-06, so the period is 2019-01-06 to 2019-01-06.

### Constraints:
- Dates are within a reasonable range.
- Only consider dates in the year 2019.


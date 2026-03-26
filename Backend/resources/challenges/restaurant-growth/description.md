# Restaurant Growth

Write a SQL query to compute the moving average of how much the customer paid in a seven-day window (current day + 6 days before). `average_amount` should be **rounded to two decimal places**.

Return the result table ordered by `visited_on` in **ascending order**.

The query result format is in the following example.

Table: `Customer`
| Column Name | Type |
| :--- | :--- |
| customer_id | int |
| name | varchar |
| visited_on | date |
| amount | int |

`(customer_id, visited_on)` is the primary key for this table.
This table contains data about customer transactions in a restaurant.

### Example 1:
**Input:** 
`Customer` table:
| customer_id | name | visited_on | amount |
| :--- | :--- | :--- | :--- |
| 1 | Jhon | 2019-01-01 | 100 |
| 2 | Daniel | 2019-01-02 | 110 |
| 3 | Jade | 2019-01-03 | 120 |
| 4 | Khaled | 2019-01-04 | 130 |
| 5 | Winston | 2019-01-05 | 110 |
| 6 | Elvis | 2019-01-06 | 140 |
| 7 | Anna | 2019-01-07 | 150 |
| 8 | Maria | 2019-01-08 | 80 |
| 9 | Jaze | 2019-01-09 | 110 |
| 1 | Jhon | 2019-01-10 | 130 |

**Output:** 
| visited_on | amount | average_amount |
| :--- | :--- | :--- |
| 2019-01-07 | 860 | 122.86 |
| 2019-01-08 | 840 | 120 |
| 2019-01-09 | 840 | 120 |
| 2019-01-10 | 850 | 121.43 |

**Explanation:** 
1st moving average from 2019-01-01 to 2019-01-07 has sum = 100 + 110 + 120 + 130 + 110 + 140 + 150 = 860. Average = 860 / 7 = 122.86.
2nd moving average from 2019-01-02 to 2019-01-08 has sum = 110 + 120 + 130 + 110 + 140 + 150 + 80 = 840. Average = 840 / 7 = 120.
... and so on.

### Constraints:
- There will be at least 7 days of data.

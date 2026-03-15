# Game Play Analysis I

## Table Schema

```sql
CREATE TABLE Activity (
    player_id INT,
    device_id INT,
    event_date DATE,
    games_played INT,
    PRIMARY KEY (player_id, event_date)
);
```

Each row is a record of a player who logged in and played some number of games (possibly 0) using some device on a given date.

## Problem Statement

Write a SQL query to report the **first login date** for each player.

Return the result table with columns `player_id` and `first_login` in **any order**.

## Example 1

**Input:**

Activity table:
| player_id | device_id | event_date | games_played |
|-----------|-----------|------------|--------------|
| 1         | 2         | 2016-03-01 | 5            |
| 1         | 2         | 2016-05-02 | 6            |
| 2         | 3         | 2017-06-25 | 1            |
| 3         | 1         | 2016-03-02 | 0            |
| 3         | 4         | 2018-07-03 | 5            |

**Output:**

| player_id | first_login |
|-----------|-------------|
| 1         | 2016-03-01  |
| 2         | 2017-06-25  |
| 3         | 2016-03-02  |

**Explanation:** Player 1 first logged in on 2016-03-01. Player 2 first on 2017-06-25. Player 3 first on 2016-03-02.

## Constraints

- The table can have up to 10^5 rows.
- `event_date` is a valid date.

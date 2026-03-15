# Article Views I

## Table Schema

```sql
CREATE TABLE Views (
    article_id INT,
    author_id INT,
    viewer_id INT,
    view_date DATE
);
```

There is no primary key for this table; it may have duplicate rows.
Each row of this table indicates that some viewer viewed an article (written by some author) on some date.
Note that equal `author_id` and `viewer_id` indicate the same person.

## Problem Statement

Write a SQL query to find all the authors that viewed at least one of their own articles.

Return the result table sorted by `id` in ascending order.

## Example 1

**Input:**

Views table:
| article_id | author_id | viewer_id | view_date  |
|------------|-----------|-----------|------------|
| 1          | 3         | 5         | 2019-08-01 |
| 1          | 3         | 6         | 2019-08-02 |
| 2          | 7         | 7         | 2019-08-01 |
| 2          | 7         | 6         | 2019-08-02 |
| 4          | 7         | 1         | 2019-07-22 |
| 3          | 4         | 4         | 2019-07-21 |
| 3          | 4         | 4         | 2019-07-21 |

**Output:**

| id |
|----|
| 4  |
| 7  |

**Explanation:** Author 4 viewed article 3 on 2019-07-21, and author 7 viewed article 2 on 2019-08-01.

## Constraints

- The table can have up to 10^6 rows.
- `article_id`, `author_id`, and `viewer_id` are positive integers.

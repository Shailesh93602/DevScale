# Duplicate Emails

## Table Schema

```sql
CREATE TABLE Person (
    id INT PRIMARY KEY,
    email VARCHAR(255)
);
```

`id` is the primary key column. Each row contains an email. Emails will not contain uppercase letters.

## Problem Statement

Write a SQL query to report all duplicate emails. A duplicate email is one that appears more than once in the table.

Return the result table with the column name `Email` in **any order**.

## Example 1

**Input:**

Person table:
| id | email   |
|----|---------|
| 1  | a@b.com |
| 2  | c@d.com |
| 3  | a@b.com |

**Output:**

| Email   |
|---------|
| a@b.com |

**Explanation:** a@b.com appears twice, so it is a duplicate.

## Example 2

**Input:**

Person table:
| id | email        |
|----|--------------|
| 1  | joe@mail.com |
| 2  | bob@mail.com |
| 3  | joe@mail.com |
| 4  | joe@mail.com |
| 5  | bob@mail.com |

**Output:**

| Email        |
|--------------|
| joe@mail.com |
| bob@mail.com |

## Constraints

- The table can have up to 10^4 rows.
- Emails will not contain uppercase letters.

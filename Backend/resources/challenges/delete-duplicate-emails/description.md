# Delete Duplicate Emails

## Table Schema

```sql
CREATE TABLE Person (
    id INT PRIMARY KEY,
    email VARCHAR(255)
);
```

`id` is the primary key column for this table. Each row contains an email. Emails will not contain uppercase letters.

## Problem Statement

Write a SQL query to **delete** all duplicate email entries in the `Person` table, keeping only one unique email with the **smallest** `id`.

Note that you are asked to write a DELETE statement, not a SELECT statement.

## Example 1

**Input:**

Person table:
| id | email            |
|----|------------------|
| 1  | john@example.com |
| 2  | bob@example.com  |
| 3  | john@example.com |

**Output:**

| id | email            |
|----|------------------|
| 1  | john@example.com |
| 2  | bob@example.com  |

**Explanation:** john@example.com is duplicated. We keep the row with the smallest id (id=1) and delete id=3.

## Example 2

**Input:**

Person table:
| id | email        |
|----|--------------|
| 1  | a@b.com      |
| 2  | c@d.com      |
| 3  | a@b.com      |
| 4  | c@d.com      |
| 5  | a@b.com      |

**Output:**

| id | email        |
|----|--------------|
| 1  | a@b.com      |
| 2  | c@d.com      |

## Constraints

- The table can have up to 10^4 rows.
- Emails will not contain uppercase letters.

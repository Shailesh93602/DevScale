# Movie Rating

## Table Schema

```sql
CREATE TABLE Movies (
    movie_id INT PRIMARY KEY,
    title VARCHAR(255)
);

CREATE TABLE Users (
    user_id INT PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE MovieRating (
    movie_id INT REFERENCES Movies(movie_id),
    user_id INT REFERENCES Users(user_id),
    rating INT,
    created_at DATE,
    PRIMARY KEY (movie_id, user_id)
);
```

## Problem Statement

Write a SQL query to:
1. Find the name of the user who has rated the greatest number of movies. In case of a tie, return the lexicographically smaller user name.
2. Find the movie name with the highest average rating in February 2020. In case of a tie, return the lexicographically smaller movie name.

The result should have a single column `results` with two rows — the user name first, then the movie name.

## Example 1

**Input:**

Movies table:
| movie_id | title    |
|----------|----------|
| 1        | Avengers |
| 2        | Frozen 2 |
| 3        | Joker    |

Users table:
| user_id | name   |
|---------|--------|
| 1       | Daniel |
| 2       | Monica |
| 3       | Maria  |
| 4       | James  |

MovieRating table:
| movie_id | user_id | rating | created_at |
|----------|---------|--------|------------|
| 1        | 1       | 3      | 2020-01-12 |
| 1        | 2       | 4      | 2020-02-11 |
| 1        | 3       | 2      | 2020-02-12 |
| 1        | 4       | 1      | 2020-01-01 |
| 2        | 1       | 5      | 2020-02-17 |
| 2        | 2       | 2      | 2020-02-01 |
| 2        | 3       | 2      | 2020-03-01 |
| 3        | 1       | 3      | 2020-02-22 |
| 3        | 2       | 4      | 2020-02-25 |

**Output:**

| results  |
|----------|
| Daniel   |
| Frozen 2 |

**Explanation:** Daniel rated 3 movies, Monica rated 3 movies — Daniel is alphabetically first. In Feb 2020, Frozen 2 average = (5+2)/2 = 3.5, Avengers = (4+2)/2 = 3, Joker = (3+4)/2 = 3.5. Frozen 2 wins alphabetically.

## Constraints

- Each user can rate each movie only once.
- Rating is between 1 and 5.

# Students Unable to Eat Lunch

## Table Schema

```sql
CREATE TABLE Students (
    student_id INT PRIMARY KEY,
    preference INT  -- 0 for circular, 1 for square
);

CREATE TABLE Sandwiches (
    sandwich_id INT PRIMARY KEY,
    type INT,       -- 0 for circular, 1 for square
    position INT    -- position in the stack (1 = top)
);
```

## Problem Statement

The school cafeteria offers circular and square sandwiches (represented by 0 and 1 respectively). Students stand in a queue and each prefers either circular or square. The sandwich on top of the stack is served. If the student at the front of the queue prefers it, they take it and leave. Otherwise, they go to the end of the queue.

This continues until none of the queue students want the top sandwich — the remaining students cannot eat.

Given the Students table with their preferences and the Sandwiches table with sandwich types and their positions in the stack, write a query to count the number of students who are unable to eat.

## Example 1

**Input:**

Students table:
| student_id | preference |
|------------|------------|
| 1          | 1          |
| 2          | 1          |
| 3          | 0          |
| 4          | 0          |

Sandwiches table:
| sandwich_id | type | position |
|-------------|------|----------|
| 1           | 0    | 1        |
| 2           | 1    | 2        |
| 3           | 0    | 3        |
| 4           | 1    | 4        |

**Output:**

| count |
|-------|
| 0     |

**Explanation:** All students can eat. The circular sandwiches (type 0) match students with preference 0, and square sandwiches match students with preference 1.

## Example 2

**Input:**

Students table:
| student_id | preference |
|------------|------------|
| 1          | 1          |
| 2          | 1          |
| 3          | 1          |

Sandwiches table:
| sandwich_id | type | position |
|-------------|------|----------|
| 1           | 0    | 1        |
| 2           | 1    | 2        |
| 3           | 1    | 3        |

**Output:**

| count |
|-------|
| 1     |

**Explanation:** The top sandwich is type 0, but no remaining student wants it, so 1 student who wants type 0 cannot eat. Wait, all students want type 1 — so 1 student is left because there are 3 students wanting type 1 but only 2 type-1 sandwiches.

## Constraints

- 1 <= number of students <= 100
- preference is 0 or 1
- type is 0 or 1
- Number of sandwiches equals number of students

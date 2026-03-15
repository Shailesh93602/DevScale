# Investments in 2016

## Table Schema

```sql
CREATE TABLE Insurance (
    pid INT PRIMARY KEY,
    tiv_2015 FLOAT,
    tiv_2016 FLOAT,
    lat FLOAT,
    lon FLOAT
);
```

- `pid` is the primary key.
- `tiv_2015` is the total investment value in 2015.
- `tiv_2016` is the total investment value in 2016.
- `lat` and `lon` are the latitude and longitude of the policyholder's city. Pairs of (lat, lon) are guaranteed to be unique.

## Problem Statement

Write a SQL query to report the sum of all total investment values in 2016 (`tiv_2016`), for all policyholders who:

1. Have the same `tiv_2015` value as one or more other policyholders, **AND**
2. Are not located in the same city as any other policyholder (i.e., the (lat, lon) pair is unique).

Round the result to 2 decimal places.

## Example 1

**Input:**

Insurance table:
| pid | tiv_2015 | tiv_2016 | lat | lon |
|-----|----------|----------|-----|-----|
| 1   | 10       | 5        | 10  | 10  |
| 2   | 20       | 20       | 20  | 20  |
| 3   | 10       | 30       | 20  | 20  |
| 4   | 10       | 40       | 40  | 40  |

**Output:**

| tiv_2016 |
|----------|
| 45.00    |

**Explanation:**
- Policyholders 1, 3, and 4 have the same tiv_2015 (10). Policyholder 2 does not share tiv_2015 with anyone.
- Policyholders 2 and 3 are in the same city (20, 20), so both are excluded on the location criterion.
- Policyholder 1: tiv_2015=10 (shared) and unique location (10,10) -> qualifies. tiv_2016 = 5.
- Policyholder 4: tiv_2015=10 (shared) and unique location (40,40) -> qualifies. tiv_2016 = 40.
- Total = 5 + 40 = 45.00.

## Constraints

- The table can have up to 10^4 rows.

# First Bad Version

You are a product manager and currently leading a team to develop a new product. Unfortunately, the latest version of your product fails the quality check. Since each version is developed based on the previous version, all the versions after a bad version are also bad.

Suppose you have `n` versions `[1, 2, ..., n]` and you want to find out the first bad one, which causes all the following ones to be bad.

You are given an API `isBadVersion(version)` which returns whether `version` is bad. Implement a function to find the first bad version. You should minimize the number of calls to the API.

---

## Examples

**Example 1:**
```
Input: n = 5, bad = 4
Output: 4
Explanation:
isBadVersion(3) -> false
isBadVersion(5) -> true
isBadVersion(4) -> true
So 4 is the first bad version.
```

**Example 2:**
```
Input: n = 1, bad = 1
Output: 1
```

**Example 3:**
```
Input: n = 10, bad = 1
Output: 1
Explanation: All versions are bad. Version 1 is the first bad one.
```

---

## Constraints

- `1 <= bad <= n <= 2^31 - 1`

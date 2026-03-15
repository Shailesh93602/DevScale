# N-th Tribonacci Number

The Tribonacci sequence T(n) is defined as follows:

```
T(0) = 0, T(1) = 1, T(2) = 1
T(n) = T(n-1) + T(n-2) + T(n-3), for n >= 3
```

Given `n`, return the value of `T(n)`.

---

## Examples

**Example 1:**
```text
Input: n = 4
Output: 4
Explanation:
T(3) = 0 + 1 + 1 = 2
T(4) = 1 + 1 + 2 = 4
```

**Example 2:**
```text
Input: n = 25
Output: 1389537
```

---

## Constraints

- `0 <= n <= 37`
- The answer is guaranteed to fit within a 32-bit integer.

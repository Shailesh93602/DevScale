# Editorial — Counting Bits

## Problem Summary
For every number from `0` to `n`, calculate the number of set bits (1s) in its binary representation.

## Approach: Dynamic Programming (Linear Time)
While we can use built-in popcount functions or iterate bits for each number ($O(n \log n)$), we can achieve $O(n)$ using Dynamic Programming.

### The Recurrence Relation:
Let `dp[i]` be the number of set bits in `i`.
- If we shift `i` to the right by 1 bit (`i >> 1`), we get a number we've already processed.
- The number of 1s in `i` is the same as in `i >> 1`, plus the bit we shifted off (the last bit).
- Last bit can be extracted using `i & 1` or `i % 2`.

**Formula**: `dp[i] = dp[i >> 1] + (i & 1)`

### Example:
- `dp[2]` (binary `10`):
  - `i >> 1` is `1` (binary `1`). `dp[1] = 1`.
  - `i & 1` is `0`.
  - `dp[2] = 1 + 0 = 1`.
- `dp[3]` (binary `11`):
  - `i >> 1` is `1`. `dp[1] = 1`.
  - `i & 1` is `1`.
  - `dp[3] = 1 + 1 = 2`.

### Complexity Analysis:
- **Time Complexity**: $O(n)$, as we iterate through the range once and perform constant-time operations.
- **Space Complexity**: $O(1)$ extra space (or $O(n)$ to store the result).

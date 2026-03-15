# Editorial — Bitwise AND of Numbers Range

## Problem Summary
The task is to find the bitwise AND of all numbers within the range `[left, right]`.

## Key Insight
As we iterate through numbers in a range, the lower bits change very frequently. For any range `[left, right]` where `left < right`, the last bit of at least one number in the range will be `0`, and the last bit of at least one number will be `1`. Thus, the bitwise AND of the entire range will eventually zero out all the trailing bits that are not part of the **common prefix**.

The result is simply the **common bit prefix** of `left` and `right`, with all other bits set to `0`.

## Approach: Bit Shifting
1. Keep shifting both `left` and `right` to the right until they become equal.
2. Count the number of shifts required (`shiftCount`).
3. Once equal, shift the value back to the left by `shiftCount` to restore the zeros.

### Example: `left = 5 (101), right = 7 (111)`
- `5 != 7` -> shift: `left = 2 (10), right = 3 (11)`, `count = 1`
- `2 != 3` -> shift: `left = 1 (1), right = 1 (1)`, `count = 2`
- `1 == 1` -> stop.
- Result: `1 << 2 = 100` (binary) = `4`.

## Complexity Analysis
- **Time Complexity**: $O(1)$, since there are at most 31 iterations (for 32-bit integers).
- **Space Complexity**: $O(1)$.

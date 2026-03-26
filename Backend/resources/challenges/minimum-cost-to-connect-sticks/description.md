# Minimum Cost to Connect Sticks

You have some number of sticks with positive integer lengths. These lengths are given as an array `sticks`, where `sticks[i]` is the length of the $i^{th}$ stick.

You can connect any two sticks of lengths `x` and `y` into one stick by paying a cost of `x + y`. You must connect all the sticks until there is only one stick remaining.

Return *the minimum cost of connecting all the given sticks into one stick in this way*.

### Example 1:
**Input:** `sticks = [2,4,3]`
**Output:** `14`
**Explanation:** 
1. Connect 2 and 3 for a cost of 5. Now you have [5, 4].
2. Connect 5 and 4 for a cost of 9. Now you have [9].
Total cost is 5 + 9 = 14.

### Example 2:
**Input:** `sticks = [1,8,3,5]`
**Output:** `30`

### Constraints:
- `1 <= sticks.length <= 10^4`
- `1 <= sticks[i] <= 10^4`

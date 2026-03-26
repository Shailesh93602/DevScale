# Editorial — Find All Duplicates in an Array

### Approach: In-place Marking (Negation)
Since all the integers are in the range $[1, n]$, we can use the input array itself to keep track of which numbers we have seen. 

For each number $x$ in the array:
1. Calculate the corresponding index: `index = abs(x) - 1`.
2. Check the value at `nums[index]`.
   - If it's negative, it means we have encountered $x$ before. Add `abs(x)` to our result list.
   - If it's positive, negate it (`nums[index] = -nums[index]`) to mark that we have seen $x$ once.

**Example**
`nums = [4, 3, 2, 7, 8, 2, 3, 1]`
- `x=4`: index 3. `nums[3]` becomes -7.
- `x=3`: index 2. `nums[2]` becomes -2.
- ...
- `x=2`: index 1. `nums[1]` is already -3. Wait, no.
- Let's re-trace:
  1. `4` -> index 3. `nums[3]` is 7 -> -7.
  2. `3` -> index 2. `nums[2]` is 2 -> -2.
  3. `2` -> index 1. `nums[1]` is 3 -> -3.
  4. `7` -> index 6. `nums[6]` is 3 -> -3.
  5. `8` -> index 7. `nums[7]` is 1 -> -1.
  6. `2` (again) -> index 1. `nums[1]` is -3 (negative!). Duplicate found: 2.
  7. `3` (again) -> index 2. `nums[2]` is -2 (negative!). Duplicate found: 3.
  8. `1` -> index 0. `nums[0]` is 4 -> -4.

**Complexity**
- Time: $O(n)$ as we iterate through the array once.
- Space: $O(1)$ extra space (excluding the output list).

# Editorial — 4Sum

## Problem Summary
Find all unique quadruplets in an array that sum up to a specific `target` value. The result must not contain duplicate quadruplets.

## Approach: Sorting + Two Pointers
The problem is an extension of **3Sum**. Since we need the sum of 4 numbers, we can use two nested loops to fix the first two numbers and then use the **Two Pointers** technique to find the remaining two.

### Step-by-Step Algorithm:
1. **Sort the array**: This allows us to use two pointers and easily skip duplicate values.
2. **First Loop (i)**: Iterate from `0` to `n-4`. 
   - Skip if `nums[i]` is the same as `nums[i-1]`.
   - **Pruning**: If the sum of the four smallest elements starting with `i` is greater than `target`, we can stop the loop. If the sum of `nums[i]` and the three largest elements is less than `target`, we can skip this `i`.
3. **Second Loop (j)**: Iterate from `i+1` to `n-3`.
   - Skip if `nums[j]` is the same as `nums[j-1]`.
   - **Pruning**: Similar to the first loop, check the smallest and largest possible sums for the current `i` and `j`.
4. **Two Pointers (left, right)**: Set `left = j+1` and `right = n-1`.
   - While `left < right`:
     - If `sum === target`, add to result and move both pointers past duplicates.
     - If `sum < target`, increment `left`.
     - If `sum > target`, decrement `right`.

### Complexity Analysis:
- **Time Complexity**: $O(n^3)$. Sorting takes $O(n \log n)$, and the triple loop structures take $O(n \times n \times n) = O(n^3)$.
- **Space Complexity**: $O(1)$ extra space if we don't count the space for the output and sorting overhead.

## Alternative Approach: Hash Map
We could use a Hash Map to store pairwise sums, which would reduce the time complexity to $O(n^2)$ on average but significantly increase the space complexity and make it harder to handle duplicate quadruplets. Given the $n=200$ constraint, $O(n^3)$ is extremely efficient and simpler to implement.

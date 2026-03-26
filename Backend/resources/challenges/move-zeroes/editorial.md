# Editorial — Move Zeroes

### Two-Step Approach (Sub-optimal)
A simple way to do this is to iterate through the array and move all non-zero elements to the front, then fill the rest with zeros.
1.  Use a pointer `writeIdx` initialized to 0.
2.  Iterate through `nums`. If `nums[i]` is not 0, set `nums[writeIdx] = nums[i]` and increment `writeIdx`.
3.  Fill the remaining positions from `writeIdx` to the end of the array with 0.

### One-Step Optimal Approach (Two Pointers)
We can reduce the number of writes by using a **Swap** strategy.
-   Maintain a `lastNonZero` pointer.
-   When we encounter a non-zero element, swap it with the element at `lastNonZero` and increment `lastNonZero`.

This works because the elements before `lastNonZero` are always non-zeros, and the elements between `lastNonZero` and the current `i` are always zeros.

### Complexity Analysis
- **Time Complexity**: $O(N)$ as we visit each element once.
- **Space Complexity**: $O(1)$ in-place modification.

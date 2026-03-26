# Editorial — 3Sum Closest

### Two Pointers Technique
This problem is a variation of the 3Sum problem. Instead of finding a sum equal to zero, we want a sum that is as close to a `target` as possible.

### Algorithm
1.  **Sort**: First, sort the array `nums`. This allows us to use two pointers to explore sums efficiently.
2.  **Iterate**: Loop through the array with a fixed first element `nums[i]`.
3.  **Two Pointers**: For each `i`, initialize `left = i + 1` and `right = nums.length - 1`.
    -   Calculate `currentSum = nums[i] + nums[left] + nums[right]`.
    -   If `currentSum` is closer to the target than our previously saved `closestSum`, update `closestSum`.
    -   If `currentSum < target`, we need a larger sum, so move `left++`.
    -   If `currentSum > target`, we need a smaller sum, so move `right--`.
    -   If `currentSum == target`, we found the perfect sum and can return immediately.

### Why does this work?
By sorting the array, we can make informed decisions about whether to increase or decrease the sum by moving either the left or the right pointer. This reduces the problem from $O(N^3)$ (brute force) to $O(N^2)$.

### Complexity Analysis
- **Time Complexity**: $O(N^2)$ where $N$ is the number of elements. Sorting takes $O(N \log N)$ and the nested loops take $O(N^2)$.
- **Space Complexity**: $O(1)$ or $O(\log N)$ depending on the sort implementation.


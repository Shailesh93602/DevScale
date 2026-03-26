# Editorial — Subsets II

### Approach: Backtracking
The goal is to find all unique subsets. When the input contains duplicates, we can generate the same subset multiple times unless we have a strategy to skip them.

1. **Sort the array**: This brings duplicates together.
2. **Backtrack**: Explore all possible combinations of elements.
3. **Handle Duplicates**: In the loop `for (let i = startIndex; i < nums.length; i++)`:
   - If `i > startIndex` and `nums[i] === nums[i - 1]`, we skip `nums[i]`.
   - Why? Because `nums[i-1]` has already been used to generate all possible subsets in this position at this recursion level. Using `nums[i]` would just lead to a redundant set of results.

**Complexity**
- Time: $O(N \cdot 2^N)$ because there are $2^N$ possible subsets and we copy each subset to the result list.
- Space: $O(N)$ for the recursion depth.

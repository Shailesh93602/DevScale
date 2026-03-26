# Editorial — Permutations II

### Approach: Backtracking with Pruning
Generating all permutations of an array with duplicates requires careful management to avoid redundant work and identical results.

1. **Sort the input**: Sorting makes it easy to identify duplicates because they will be adjacent.
2. **Backtrack**: Use recursion to build the permutation.
3. **Prune duplicates**: When deciding which element to pick for the next position in the current permutation:
   - Skip the current element if it's the same as the previous element (`nums[i] === nums[i-1]`) AND the previous element has not been used yet in the current recursive branch (`!used[i-1]`). 
   - This rule ensures that we only pick the first available instance of a duplicate number to start a specific "slot" in the permutation, thus preventing duplicates.

**Complexity**
- Time: $O(N \times N!)$ where $N$ is the number of elements. There are at most $N!$ permutations and we do $O(N)$ work to build each.
- Space: $O(N)$ for the recursion stack and the `used` array.

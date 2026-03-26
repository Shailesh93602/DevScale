# Editorial — Squares of a Sorted Array

### Approach 1: Sort (Naive)
Square each element in the array and then sort it using any sorting algorithm like Timsort or Quicksort.
**Complexity**
- Time: $O(n \log n)$
- Space: $O(n)$ or $O(\log n)$ depending on the sorting algorithm.

### Approach 2: Two Pointers (Optimal)
Since the array is sorted, the elements at the extreme ends will have the largest squares (either large positive or large negative numbers). 
1. Initialize two pointers: `left = 0` and `right = n - 1`.
2. Compare the square of `nums[left]` and `nums[right]`.
3. Place the larger square at the end of the result array and move that pointer.
4. Continue until the pointers meet.

**Complexity**
- Time: $O(n)$ as we visit each element exactly once.
- Space: $O(n)$ to store the result array (which is required by the problem).

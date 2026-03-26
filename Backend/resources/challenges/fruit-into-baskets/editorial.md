# Editorial — Fruit Into Baskets

### Approach: Sliding Window
The problem asks for the longest subarray that contains at most two distinct integers. This is a classic sliding window problem.

**Algorithm**
1. We use two pointers, `left` and `right`, to define a window.
2. As we move `right` forward, we add the fruit type to a count map (the "baskets").
3. If the number of distinct fruit types in our baskets exceeds 2:
   - Move `left` forward and decrement the count of the fruit at `left`.
   - If the count of a fruit type becomes 0, remove it from the baskets.
4. The maximum size of the window throughout the process is our answer.

**Complexity**
- Time: $O(N)$ because both `left` and `right` pointers travel across the array only once.
- Space: $O(1)$ since the number of distinct fruit types in the hash map is at most 3 at any time.

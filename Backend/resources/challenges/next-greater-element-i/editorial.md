# Editorial — Next Greater Element I

### The Monotonic Stack Pattern
This problem is a classic application of a **Monotonic Stack**. A monotonic stack is a stack where elements are always in a certain order (increasing or decreasing).

### Approach
1.  **Analyze `nums2`**: Since `nums1` is a subset of `nums2`, we should pre-calculate the "Next Greater Element" for **every** element in `nums2`. We'll store these results in a Hash Map for $O(1)$ lookup.
2.  **Using the Stack**:
    - Iterate through `nums2`.
    - Maintain a "Monotonic Decreasing Stack". 
    - When you encounter a number `num` that is **greater** than the top of the stack, it means `num` is the "Next Greater Element" for the element at the top.
    - `pop()` the top, store the relationship in the map (`map.set(top, num)`), and repeat if there are more elements on the stack smaller than `num`.
    - Push `num` onto the stack.
3.  **Process `nums1`**: Simply map each element in `nums1` to its value in our pre-calculated map.

### Complexity Analysis
- **Time Complexity**: $O(N + M)$ where $N$ and $M$ are lengths of `nums1` and `nums2`. We traverse `nums2` once and `nums1` once.
- **Space Complexity**: $O(M)$ to store the map and the stack.


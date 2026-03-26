# Editorial — Next Greater Element II

### The Circular Challenge
This problem is very similar to "Next Greater Element I", but with two key twists:
1. The array is **circular**.
2. We need to find the result for **every** element in the original array order.

### Handling Circularity
A common trick to handle circular arrays is to imagine the array concatenated with itself: `[a, b, c]` becomes `[a, b, c, a, b, c]`. 

Instead of actually duplicating the array (which takes extra memory), we can simulate this by iterating from `0` to `2 * n - 1` and using the modulo operator `% n` to access elements.

### The Monotonic Stack
We use a **Monotonic Decreasing Stack** to keep track of elements for which we haven't found a "next greater" value yet.

### Algorithm
1. Initialize an array `result` of size `n` with `-1`.
2. Initialize an empty `stack` to store **indices** (indices allow us to map back to the `result` array).
3. Iterate from `i = 0` to `2 * n - 1`:
   - Current number `num = nums[i % n]`.
   - While the stack is not empty and `nums[stack.top()] < num`:
     - We've found the next greater element for the index at the top of the stack.
     - `result[stack.pop()] = num`.
   - If `i < n`, push `i` onto the stack (we only need to find results for the first `n` elements; the second pass is just to help find circular neighbors).
4. Return `result`.

### Complexity Analysis
- **Time Complexity**: $O(N)$ where $N$ is the number of elements. Each index is pushed and popped at most once.
- **Space Complexity**: $O(N)$ for the stack and result array.

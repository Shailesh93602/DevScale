# Editorial — Sliding Window Maximum

### Approach: Monotonic Queue
To solve this in $O(N)$ time, we need a data structure that allows us to find the maximum of the current window in $O(1)$ and update the maximum as the window slides in $O(1)$ amortized time.

**Monotonic Queue Logic**
We use a **Deque** (double-ended queue) to store **indices** of elements. We maintain the property that the elements corresponding to these indices are in **strictly decreasing order**.

1. **New Element (`nums[i]`)**:
   - Before adding index `i`, we remove all indices `j` from the back of the deque where `nums[j] <= nums[i]`. These elements will never be the maximum because `nums[i]` is larger and stays in the window longer.
   - Push index `i` to the back.
2. **Window Slide**:
   - If the index at the front of the deque is `i - k`, it's now out of the window. Remove it from the front.
3. **Result**:
   - For all `i >= k - 1`, the current maximum for the window ending at `i` is `nums[deque.front()]`.

**Complexity**
- Time: $O(N)$. Each element is pushed and popped from the deque at most once.
- Space: $O(K)$ for the deque.

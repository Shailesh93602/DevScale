# Editorial — Sliding Window Maximum

### Approach: Monotonic Deque
The most efficient way to solve this problem is using a Monotonic Deque. A deque (Double-Ended Queue) allows us to add and remove elements from both the front and the back in $O(1)$.

**Algorithm**
1. Maintain a deque of indices. The deque will be "monotonic decreasing" in terms of the values at those indices.
2. For each element `nums[i]` at index `i`:
   - **Clean up indices**: Remove indices from the front of the deque if they are outside the current window ($index < i - k + 1$).
   - **Maintain Monotonicity**: Remove indices from the back of the deque if their corresponding value is smaller than `nums[i]`. These elements can never be the maximum in a window containing `nums[i]`.
   - **Add new index**: Push `i` to the back of the deque.
   - **Get Maximum**: The index at the front of the deque always points to the largest element in the current window.

**Why this works?**
By removing smaller elements from the back, we ensure that the deque only contains "candidates" for the future maximum. If a new element is larger than previous ones, the previous ones become irrelevant.

**Complexity**
- Time: $O(N)$ because each element is added and removed from the deque at most once.
- Space: $O(K)$ to store indices in the deque.

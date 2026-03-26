# Editorial — Implement Queue using Stacks

### Approach: Two Stacks (Amortized $O(1)$)
A queue is FIFO (First In First Out), and a stack is LIFO (Last In First Out). To simulate FIFO using LIFO, we can use two stacks: `stack1` and `stack2`.

- **Push**: Simply push the element onto `stack1`.
- **Pop / Peek**: 
  - If `stack2` is not empty, the element at the top of `stack2` is the front of the queue.
  - If `stack2` is empty, we "transfer" all elements from `stack1` to `stack2`. This process reverses the order of elements, so the oldest element moves to the top of `stack2`.

**Complexity Analysis**
- **Push**: $O(1)$.
- **Pop / Peek**: Amortized $O(1)$. While a single `pop` might take $O(n)$ if `stack2` is empty, each element is pushed and popped at most twice (one push/pop for `stack1`, and one push/pop for `stack2`). Over a sequence of $n$ operations, the total time is $O(n)$, giving an amortized time of $O(1)$.
- **Space**: $O(n)$ to store $n$ elements.

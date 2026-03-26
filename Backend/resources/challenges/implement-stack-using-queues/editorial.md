# Editorial — Implement Stack using Queues

### Approach: One Queue (Push: $O(n)$, Pop: $O(1)$)
A stack is LIFO (Last In First Out), and a queue is FIFO (First In First Out). To simulate LIFO using a single FIFO queue, we can ensure that the last element added is always at the front of the queue.

**Push Operation**
When we push a new element $x$:
1. Add $x$ to the back of the queue.
2. For all other elements already in the queue, remove them from the front and add them back to the end of the queue. This effectively "rotates" the queue so that $x$ is now at the front.

**Example**
1. Queue: `[]`, Push(1) -> `[1]`
2. Push(2) -> Add to back: `[1, 2]` -> Rotate: `[2, 1]`
3. Push(3) -> Add to back: `[2, 1, 3]` -> Rotate(2 times): `[1, 3, 2]` -> `[3, 2, 1]`

**Complexity Analysis**
- **Push**: $O(n)$. Each push requires rotating all existing elements.
- **Pop / Top**: $O(1)$. Since the top/last element is always at the front of the queue.
- **Space**: $O(n)$ to store $n$ elements.

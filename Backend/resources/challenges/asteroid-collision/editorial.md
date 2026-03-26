# Editorial — Asteroid Collision

### Using a Stack
A stack is the perfect data structure for this problem because we only care about the most recently seen asteroid when considering a potential collision.

### Logic
1.  Iterate through the `asteroids` array.
2.  A collision **only** occurs if the current asteroid is moving **left** (negative) and the previous asteroid on the stack is moving **right** (positive).
3.  While a collision condition exists:
    -   If the current negative asteroid is larger than the top of the stack, the top of the stack is destroyed (`pop`). Continue checking against the new top.
    -   If their sizes are equal, both are destroyed.
    -   If the current negative asteroid is smaller, it's destroyed.
4.  If the current asteroid survive the collisions (or wasn't moving left against a right-moving asteroid), add it to the stack.

### Edge Cases
-   `[-2, -1, 1, 2]`: No collisions. Arrows point away from each other.
-   `[5, 10, -5]`: 10 handles -5, 5 remains safe because it's behind 10.
-   All asteroids moving in the same direction: No collisions.

### Complexity Analysis
- **Time Complexity**: $O(N)$ where $N$ is the number of asteroids. Each asteroid is pushed or popped from the stack at most once.
- **Space Complexity**: $O(N)$ in the worst case where no asteroids collide.


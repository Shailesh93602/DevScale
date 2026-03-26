# Editorial — Design Circular Queue

### Approach: Array with Two Pointers
A Circular Queue (Ring Buffer) avoids the $O(N)$ cost of shifting elements in a normal array-based queue by using indices that "wrap around".

**Implementation Details**
1. **Storage**: An array `queue` of size `k`.
2. **Pointers**: 
   - `head`: Index of the first element.
   - `tail`: Index of the last element.
3. **State**: 
   - `size`: Current number of elements (makes `isEmpty` and `isFull` trivial).
4. **Modulo Arithmetic**: When incrementing `head` or `tail`, use `(index + 1) % k`.

**Example walk-through (k=3)**:
- `enQueue(1)`: `tail=0`, `queue=[1, _, _]`, `size=1`
- `enQueue(2)`: `tail=1`, `queue=[1, 2, _]`, `size=2`
- `deQueue()`: `head=1`, `size=1` (logical content is now just `[2]`)
- `enQueue(3)`: `tail=2`, `queue=[1, 2, 3]`, `size=2`
- `enQueue(4)`: `tail=0`, `queue=[4, 2, 3]`, `size=3` (wraps around)

**Complexity**
- Time: $O(1)$ for all operations.
- Space: $O(K)$ to store the elements.

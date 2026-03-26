# Editorial — Number of 1 Bits

### Approach 1: Bit Shifting
We can check each bit of the number by using a mask or by shifting. 
```typescript
while (n !== 0) {
    if ((n & 1) === 1) count++;
    n >>>= 1; // Unsigned right shift
}
```
However, this iterates through all bits (up to 31 or 32).

### Approach 2: Brian Kernighan's Algorithm
The expression `n & (n - 1)` clears the least significant bit that is set (the rightmost 1).
For example:
- `n = 12 (1100)`
- `n - 1 = 11 (1011)`
- `n & (n - 1) = 1000 (8)`

We can repeat this until `n` becomes 0. The number of iterations will be equal to the number of set bits.

**Complexity**
- Time: $O(1)$ in the sense that there are at most 32 bits, but more accurately $O(k)$ where $k$ is the number of set bits.
- Space: $O(1)$ extra space.

# Editorial — Sum of Two Integers

### Approach: Bit Manipulation
We can add two numbers by considering their sum bit by bit, similar to how we do it in base-10 addition.

1. **Sum without carry**: The XOR operator `^` acts as an addition without carry.
   - `0 ^ 0 = 0`
   - `1 ^ 0 = 1`
   - `0 ^ 1 = 1`
   - `1 ^ 1 = 0` (this is where the carry is needed)
2. **Carry**: The AND operator `&` identifies the bits that will produce a carry (where both are 1).
   - `1 & 1 = 1`
   - We need to shift this carry to the left by 1 position because a carry affects the next higher bit.

**Algorithm**
```typescript
while (b !== 0) {
    let carry = a & b;
    a = a ^ b;
    b = carry << 1;
}
```
We repeat this process until there is no carry left.

**Complexity**
- Time: $O(1)$ effectively, as it's limited by the number of bits in the integer (at most 32 iterations).
- Space: $O(1)$.

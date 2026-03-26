# Editorial — Reverse Bits

### Approach: Bit by Bit
To reverse the bits, we can simulate the process of building the result bit by bit. 
1. Initialize `result = 0`.
2. For $i$ from 0 to 31:
   - Left-shift `result` by 1.
   - If the last bit of `n` is 1, set the last bit of `result` to 1.
   - Right-shift `n` by 1.

**Note on Unsigned Right Shift**
In JavaScript, the ordinary right shift `>>` is sign-propagating. We should use the unsigned right shift `>>>` to ensure that empty slots on the left are filled with zeros, even for negative numbers (which are rare in this context but good practice).

**Complexity**
- Time: $O(1)$ since we always iterate 32 times.
- Space: $O(1)$ extra space.

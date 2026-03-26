# Editorial — Excel Sheet Column Number

### Approach: Base-26 Conversion
This problem is similar to converting a number from binary (base-2) or hexadecimal (base-16) to decimal (base-10). In this case, we have base-26, where the digits are 'A' through 'Z'.

For a string like "ABC":
- 'A' is in the 3rd position from the right: $1 \times 26^2$
- 'B' is in the 2nd position from the right: $2 \times 26^1$
- 'C' is in the 1st position from the right: $3 \times 26^0$

Wait, actually it's easier to iterate from left to right:
`result = 0`
1. Read 'A': `result = 0 * 26 + 1 = 1`
2. Read 'B': `result = 1 * 26 + 2 = 28`
3. Read 'C': `result = 28 * 26 + 3 = 731`

**Complexity**
- Time: $O(n)$ where $n$ is the length of the string.
- Space: $O(1)$ extra space.

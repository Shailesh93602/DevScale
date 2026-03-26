# Editorial — Integer to Roman

### Approach: Greedy 
To convert an integer to a Roman numeral, we should always try to use the largest possible symbol at each step. This is a greedy approach.

1. Create a table of standard Roman numeral values, including the special subtractive cases like `IV` (4), `IX` (9), `XL` (40), `XC` (90), `CD` (400), and `CM` (900).
2. Sort these values in descending order.
3. For each value-symbol pair in the table:
   - While the current number is greater than or equal to the value:
     - Subtract the value from the number.
     - Append the symbol to the result string.

**Complexity**
- Time: $O(1)$ because the input number is limited to 3999, so the number of symbols added to the string is bounded by a small constant.
- Space: $O(1)$ excluding the output string.

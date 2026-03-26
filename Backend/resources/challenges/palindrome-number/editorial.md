# Editorial — Palindrome Number

### Approach 1: Reversing Half the Number
To avoid overflow issues when reversing the entire integer (if it's large), we can reverse only the second half of the number and compare it with the first half.

For example, if the input is `1221`, we can reverse the last two digits from `21` to `12`, and compare it with the first two digits `12`. Since they are the same, we know the number is a palindrome.

**Edge Cases**
- Negative numbers are never palindromes (e.g., `-121` reversed is `121-`).
- Numbers ending in `0` (vut aren't `0` itself) are never palindromes (e.g., `10`, `100`).

**Complexity**
- Time: $O(\log_{10} n)$ as we process roughly half the digits.
- Space: $O(1)$ extra space.

### Approach 2: String Conversion
Convert the integer to a string and use two pointers to compare characters from both ends. This is simpler to implement but uses $O(n)$ space for the string ($n$ being the number of digits).

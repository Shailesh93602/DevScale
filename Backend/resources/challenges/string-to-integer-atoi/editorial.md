# Editorial — String to Integer (atoi)

## Approach: Deterministic Finite Automaton / Linear Scan (O(n) Time, O(1) Space)

The problem explicitly outlines the exact steps to solve it:
1. Ignore leading whitespace.
2. Read the sign if it exists (`+` or `-`).
3. Read the digits and stop at the first non-digit character.
4. Bound the integer to the 32-bit signed range `[-2147483648, 2147483647]`.

We can write a simple `while` loop parser that advances an index `i` through the string while building our final integer.

```typescript
function myAtoi(s: string): number {
  let i = 0;
  let sign = 1;
  let result = 0;
  const INT_MAX = 2147483647;
  const INT_MIN = -2147483648;

  // 1. Skip leading whitespaces
  while (i < s.length && s[i] === ' ') {
    i++;
  }

  // 2. Check for sign
  if (i < s.length && (s[i] === '+' || s[i] === '-')) {
    sign = s[i] === '-' ? -1 : 1;
    i++;
  }

  // 3. Process numerical digits
  while (i < s.length && s.charCodeAt(i) >= 48 && s.charCodeAt(i) <= 57) {
    // 48 is '0', 57 is '9'
    result = result * 10 + (s.charCodeAt(i) - 48);

    // 4. Check boundaries early to prevent integer overflow limits conceptually
    if (sign === 1 && result > INT_MAX) return INT_MAX;
    if (sign === -1 && result > INT_MAX + 1) return INT_MIN;
    
    i++;
  }

  return result * sign;
}
```

**Complexity:**
- **Time Complexity:** **O(n)** where $n$ is the length of string `s`. We scan through the characters at most once.
- **Space Complexity:** **O(1)** as we only use a few variables for `result`, `sign`, and `i` irrespective of string length.

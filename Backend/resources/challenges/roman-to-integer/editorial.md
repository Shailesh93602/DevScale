# Editorial — Roman to Integer

## Approach: Left-to-Right Single Pass (O(n) Time, O(1) Space)

The rules for converting Roman numerals to integers are simple. You add the value of each symbol to a total. 
The only exception is when a smaller symbol appears *before* a larger symbol (like `IX` for 9, or `IV` for 4). 
In this case, we instead subtract the smaller symbol.

We can solve this by:
1. Creating a map/dictionary of the symbol values.
2. Iterating through the string from left to right.
3. If the current symbol's value is less than the next symbol's value, we subtract it.
4. Otherwise, we add it.

```typescript
function romanToInt(s: string): number {
  const romanMap: Record<string, number> = {
    'I': 1, 'V': 5, 'X': 10, 'L': 50, 
    'C': 100, 'D': 500, 'M': 1000
  };

  let total = 0;

  for (let i = 0; i < s.length; i++) {
    const currentVal = romanMap[s[i]];
    // If we're not at the last char, and the next char is larger
    if (i < s.length - 1 && currentVal < romanMap[s[i + 1]]) {
      total -= currentVal;
    } else {
      total += currentVal;
    }
  }

  return total;
}
```

**Complexity:**
- **Time Complexity:** **O(n)**, or specifically **O(1)** since the maximum length of a valid Roman numeral is bounded (3999 evaluates to "MMMCMXCIX" length 15). We scan the string exactly once.
- **Space Complexity:** **O(1)** because we only store an object with 7 key-value pairs and an integer `total`, regardless of the string's length.

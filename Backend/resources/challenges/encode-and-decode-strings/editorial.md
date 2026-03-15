# Editorial — Encode and Decode Strings

## Problem Summary
Design an algorithm to `encode` an array of strings into a single string, and `decode` that single string back into the original array of strings. The strings can contain any ASCII characters (including the ones you might use to separate them).

## Approach: Length + Delimiter (O(n) Time, O(n) Space)

A common mistake is simply joining strings with a delimiter like `"#"` or commas. But what if the string itself contains `#`? 
`["hello", "#world"]` -> `"hello##world"`.
When decoding `"hello##world"`, does it mean `["hello", "", "world"]` or `["hello#", "world"]`? It's ambiguous!

To fix this ambiguity, every string we encode needs to declare **exactly how long it is**. We can do this with the format: `[length][delimiter][string]`.
For example, the string `"woo"` has length 3, so its encoded format should be `"3#woo"`. The delimiter `#` strictly tells us where the length integer ends and the string data begins.

`["hello", "#world"]`  -> `"5#hello6##world"`

When **decoding**:
1. Find the delimiter `#`.
2. Grab the integer before it (which is the length `L`).
3. Take exactly `L` characters after the delimiter.
4. Move the pointer forward and repeat!

```typescript
function encode(strs: string[]): string {
  let encoded = "";
  for (const str of strs) {
    encoded += str.length + "#" + str;
  }
  return encoded;
}

function decode(s: string): string[] {
  const decoded: string[] = [];
  let i = 0;
  
  while (i < s.length) {
    let j = i;
    // Find where the integer ends and the delimiter '#' starts
    while (s[j] !== '#') {
      j++;
    }
    
    // Parse the length integer
    const length = parseInt(s.substring(i, j), 10);
    
    // The actual string starts after the delimiter '#' (at j + 1)
    // and ends after 'length' characters
    const str = s.substring(j + 1, j + 1 + length);
    decoded.push(str);
    
    // Move the pointer 'i' to the next encoded string chunk
    i = j + 1 + length;
  }
  
  return decoded;
}
```

**Complexity:**
- **Time Complexity:** **O(n)**, where `n` is the total character count across all strings.
- **Space Complexity:** **O(n)** to store the intermediate encoded string and the final decoded array.

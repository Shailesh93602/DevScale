# Editorial — Reverse Words in a String

## Approach 1: Language Built-ins (O(n) Time, O(n) Space)
Most high-level languages like Python, Java, and JavaScript provide built-in string manipulation methods that make this trivial.

By splitting on one or more spaces, reversing the array, and joining with a space, we have a clean 1-2 line solution.

```typescript
function reverseWords(s: string): string {
  // \s+ matches one or more whitespace characters
  return s.trim().split(/\s+/).reverse().join(' ');
}
```
**Complexity:** Time $O(n)$, Space $O(n)$

---

## Approach 2: Two Pointers from End to Start (O(n) Time, O(n) Space)
If we were asked to avoid split/reverse built-ins (or just prefer a purely explicit algorithmic approach), we can iterate from the end of the string to the start.

We can use two pointers:
1. One to find the *end* of a word.
2. One to find the *start* of a word.
Then we just extract that substring and push it to a result array.

```typescript
function reverseWords(s: string): string {
  const words: string[] = [];
  let right = s.length - 1;

  while (right >= 0) {
    // Skip trailing spaces to find the end of a word
    while (right >= 0 && s[right] === ' ') {
      right--;
    }
    
    // If we've exhausted all characters, break
    if (right < 0) break;

    // We found a non-space character (end of a word)
    let left = right;
    
    // Find the start of the word
    while (left >= 0 && s[left] !== ' ') {
      left--;
    }
    
    // Extract the exact word substring from left+1 to right+1
    words.push(s.substring(left + 1, right + 1));
    
    // Move 'right' pointer to 'left' to continue scanning
    right = left;
  }

  return words.join(' ');
}
```

**Complexity:**
- **Time Complexity:** **O(n)**, as we touch each character at most a couple of times.
- **Space Complexity:** **O(n)** to store the array of words and the newly generated string. 
*(Note: True $O(1)$ space is impossible in Javascript/TypeScript because Strings are immutable, but in C++ you can mutate the char array directly with a Reverse Entire String -> Reverse Each Word -> Space Cleanup pipeline.)*

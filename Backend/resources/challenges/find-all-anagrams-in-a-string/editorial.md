# Editorial — Find All Anagrams in a String

## Approach: Fixed-Size Sliding Window (O(N) Time, O(1) Space)

The problem asks us to find all substrings of `s` that are anagrams of `p`. An anagram means the substring has the exact same characters with the exact same frequencies as `p`.
Since `p` has a fixed length, we are essentially looking for a **fixed-size sliding window** of length `p.length` traversing across `s`.

Instead of recalculating the character frequencies for every possible window (which would be $O(N \times P)$), we can update our window frequencies "incrementally". As the window slides one spot to the right:
- We add the new rightmost character to our frequency tracker.
- We remove the old leftmost character that just fell out of the window.
- Then, we simply compare if the window's frequency array matches `p`'s frequency array.

Since there are only 26 lowercase English letters, comparing two frequency arrays of size 26 takes exactly 26 steps (which is $O(1)$ constant time).

```typescript
function findAnagrams(s: string, p: string): number[] {
  const result: number[] = [];
  if (s.length < p.length) return result;

  const countP = new Array(26).fill(0);
  const countWindow = new Array(26).fill(0);

  // Helper to easily get Char Code Index
  const getIndex = (char: string) => char.charCodeAt(0) - 97; // 97 is 'a'

  // Initialize the frequency maps for string p and the first window in s
  for (let i = 0; i < p.length; i++) {
    countP[getIndex(p[i])]++;
    countWindow[getIndex(s[i])]++;
  }

  // Compare arrays function
  const matches = () => countP.every((val, index) => val === countWindow[index]);

  // Check the first window before sliding
  if (matches()) result.push(0);

  // Now slide the window starting from index 1 to the end
  let left = 0;
  for (let right = p.length; right < s.length; right++) {
    // Add new character on the right
    countWindow[getIndex(s[right])]++;
    
    // Remove old character on the left
    countWindow[getIndex(s[left])]--;
    left++;

    // Check if the current window matches p
    if (matches()) {
      result.push(left);
    }
  }

  return result;
}
```

**Complexity:**
- **Time Complexity:** **O(N)** where N is the length of `s`. Sliding the window takes $O(N)$ steps, and comparing the $O(1)$ size-26 map limits the time inside the loop to a constant.
- **Space Complexity:** **O(1)**. The frequency arrays are strictly bounded to size 26 regardless of the input sizes of $s$ or $p$.

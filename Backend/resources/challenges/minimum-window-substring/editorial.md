# Editorial — Minimum Window Substring

## Problem Summary
Given string `s` and `t`, find the shortest substring in `s` that contains all the characters in `t` (including duplicate frequencies).

## Approach: Sliding Window + HashMap (O(m + n) Time, O(1) Space)

We use two pointers `left` and `right` to define a "window" of the string `s`.

1. **Expand** the window by moving `right` forward. If the character is in `t`, we add it to our `windowMap`.
2. check if our `windowMap` contains all the frequencies needed by `tMap`. We track this with a `have` and `need` integer variable for O(1) checks.
3. Once we `have === need` (our window is valid), we record its length to see if it's the minimum found.
4. Then we **Shrink** from the `left` by removing the character at `left` from `windowMap`. If we shrink past a required character, `have` becomes less than `need`, and our window becomes invalid, forcing us to go back to expanding by moving `right`.

```typescript
function minWindow(s: string, t: string): string {
  if (!t || t.length > s.length) return "";

  const countT = new Map<string, number>();
  for (const c of t) countT.set(c, (countT.get(c) || 0) + 1);

  const windowCounts = new Map<string, number>();
  let have = 0;
  let need = countT.size; // number of UNIQUE characters needed

  let minLen = Infinity;
  let bestWindow = [-1, -1]; // [left, right]

  let left = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    windowCounts.set(char, (windowCounts.get(char) || 0) + 1);

    if (countT.has(char) && windowCounts.get(char) === countT.get(char)) {
      have++; 
    }

    // Shrink phase
    while (have === need) {
      // Update minimum window tracking
      if ((right - left + 1) < minLen) {
        minLen = right - left + 1;
        bestWindow = [left, right];
      }

      // Remove character at left and slide left pointer
      const leftChar = s[left];
      windowCounts.set(leftChar, windowCounts.get(leftChar)! - 1);

      if (countT.has(leftChar) && windowCounts.get(leftChar)! < countT.get(leftChar)!) {
        have--;
      }
      left++;
    }
  }

  return minLen === Infinity ? "" : s.substring(bestWindow[0], bestWindow[1] + 1);
}
```

**Complexity:**
- Time: **O(m + n)**. `left` and `right` only traverse `s` once.
- Space: **O(1)**. The HashMaps will contain at most 52 items (each lower and upper case English letter).

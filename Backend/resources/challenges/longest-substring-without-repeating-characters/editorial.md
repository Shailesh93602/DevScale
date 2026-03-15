# Editorial — Longest Substring Without Repeating Characters

## Approach 1: Brute Force O(n³)

Check every single substring possible, use a Set to find out if it has duplicates, and track the maximum length. Time Limit Exceeded.

## Approach 2: Sliding Window with Set O(n) Time, O(k) Space

We use a "sliding window" represented by two pointers: `left` and `right`.
We expand the window by moving `right`. If the character at `right` is already in our Set, we've found a duplicate. To fix this, we shrink the window from the left (removing characters from the Set and moving `left` forward) until the duplicate is removed.

```typescript
function lengthOfLongestSubstring(s: string): number {
  const charSet = new Set<string>();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    // If we've seen this character in the current window, shrink from left
    while (charSet.has(s[right])) {
      charSet.delete(s[left]);
      left++;
    }
    // Add new character to window
    charSet.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}
```
*Where `k` is the size of the character set (e.g. 26 or 128).*

## Approach 3: Optimized Sliding Window with Map O(n)

Instead of a Set, we can use a Map that stores `(character, indexOfLastAppearance)`.
If we see a duplicate, instead of stepping `left` forward one by one in a while loop, we can just instantly jump `left` to `lastAppearanceIndex + 1`!

```typescript
function lengthOfLongestSubstring(s: string): number {
  const map = new Map<string, number>();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    
    // If we've seen this char AND its last appearance is inside our current window
    if (map.has(char) && map.get(char)! >= left) {
      // Jump left directly past the duplicate
      left = map.get(char)! + 1;
    }
    
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}
```

This is the most strictly optimal O(n) approach.

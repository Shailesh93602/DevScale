# Editorial — Longest Repeating Character Replacement

## Approach 1: Sliding Window (O(n) Time, O(1) Space)

The goal is to find the longest substring that, after changing at most $k$ characters, consists of just one repeating letter.

**Insight:**
Any "valid" window must follow this rule:
`windowLength - countOfMostFrequentCharacter <= k`

If the number of "other" characters (which need to be replaced) exceeds `k`, the window is invalid, and we must shrink it from the left.

We use an array of size 26 to keep track of character frequencies in the current window.

```typescript
function characterReplacement(s: string, k: number): number {
  const count = new Array(26).fill(0);
  let left = 0;
  let maxFreq = 0;
  let maxLen = 0;
  
  for (let right = 0; right < s.length; right++) {
    // Add the new character to our window count
    const rightCharIdx = s.charCodeAt(right) - 65;
    count[rightCharIdx]++;
    
    // We only care about the MAXIMUM frequency ever seen in ANY window. 
    maxFreq = Math.max(maxFreq, count[rightCharIdx]);
    
    // Check if window is invalid (requires more than k replacements)
    const windowLength = right - left + 1;
    if (windowLength - maxFreq > k) {
      // Shrink left
      const leftCharIdx = s.charCodeAt(left) - 65;
      count[leftCharIdx]--;
      left++;
    }
    
    // The window might have shrunk slightly but we 
    // simply track the width of the max valid window seen
    maxLen = Math.max(maxLen, right - left + 1);
  }
  
  return maxLen;
}
```

### Why don't we decrement `maxFreq` when shrinking the window?
Because we are asked to find the **maximum** length! A window can only get bigger if we find a character frequency that **beats** our historical `maxFreq`. It doesn't matter if the frequency of the current local window dips below `maxFreq`. We never "shrink" our returned `maxLen`, we just slide the window forward until it can expand again.

**Complexity:**
- Time: **O(n)** — We iterate through the string a single time. 
- Space: **O(1)** — Our count array is fixed at size 26.

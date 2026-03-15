# Editorial — Count and Say

## Approach: Iterative Generation (O(M) Time, O(M) Space, where M is cumulative length of output strings)

The definition of the sequence is pure simulation. To find the $n^{th}$ string in the sequence, you simply need to build it step by step from $n = 1$.

In each step, we read the result from the previous step. We scan the string from left to right, counting the number of identical digits. As soon as a digit changes (or we reach the end of the string), we append the `count` followed by the `digit` to our next sequence string.

```typescript
function countAndSay(n: number): string {
  // Base case
  let result = "1";

  // If n = 1, the loop won't execute, returning "1"
  for (let i = 2; i <= n; i++) {
    let currentString = "";
    let count = 1;
    
    // Scan through the previous sequence string
    for (let j = 0; j < result.length; j++) {
      // If the current character is the same as the next character, increment count
      if (result[j] === result[j + 1]) {
        count++;
      } else {
        // Character changed (or end of string). Append count + char.
        currentString += count + result[j];
        // Reset count for the new character
        count = 1;
      }
    }
    
    // Move up the sequence ladder
    result = currentString;
  }

  return result;
}
```

**Complexity:**
- **Time Complexity:** The length of the string grows significantly (but predictably bounds for up to $N = 30$). The time to generate $N$ is linearly proportional to the length of the string at $N-1$. Thus, it is bounded by the total sum of the lengths of all strings generated up to $N$.
- **Space Complexity:** The space is equivalent to the length of the longest string generated.

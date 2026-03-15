// Optimal O(n) Time, O(min(m,n)) Space — Map-based jumping sliding window
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

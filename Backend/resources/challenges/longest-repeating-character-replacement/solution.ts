// O(n) Time, O(1) Space — Sliding window
function characterReplacement(s: string, k: number): number {
  const count = new Array(26).fill(0);
  let left = 0;
  let maxFreq = 0;
  let maxLen = 0;
  
  for (let right = 0; right < s.length; right++) {
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
    
    maxLen = Math.max(maxLen, right - left + 1);
  }
  
  return maxLen;
}

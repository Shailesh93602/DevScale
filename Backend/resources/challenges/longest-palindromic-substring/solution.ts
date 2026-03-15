// Optimal O(n²) Time, O(1) Space — Expand Around Center
function longestPalindrome(s: string): string {
  if (s.length < 2) return s;

  let start = 0;
  let maxLen = 0;

  const expandAroundCenter = (left: number, right: number) => {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      const currentLen = right - left + 1;
      if (currentLen > maxLen) {
        maxLen = currentLen;
        start = left;
      }
      left--;
      right++;
    }
  };

  for (let i = 0; i < s.length; i++) {
    expandAroundCenter(i, i);
    expandAroundCenter(i, i + 1);
  }

  return s.substring(start, start + maxLen);
}

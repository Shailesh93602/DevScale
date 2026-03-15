// Optimal O(n) Time, O(1) Space — Two Pointers
function isPalindrome(s: string): boolean {
  let left = 0;
  let right = s.length - 1;
  
  // Helper to check if alphanumeric using Regex check
  // Alternatively, checking character codes is faster but more verbose
  const isAlphaNumeric = (c: string) => {
    return /^[a-zA-Z0-9]+$/.test(c);
  };

  while (left < right) {
    if (!isAlphaNumeric(s[left])) {
      left++;
    } else if (!isAlphaNumeric(s[right])) {
      right--;
    } else {
      if (s[left].toLowerCase() !== s[right].toLowerCase()) {
        return false;
      }
      left++;
      right--;
    }
  }

  return true;
}

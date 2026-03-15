function countSubstrings(s: string): number {
  let count = 0;

  const countPalindromesAroundCenter = (left: number, right: number) => {
    let localCount = 0;
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      localCount++;
      left--;
      right++;
    }
    return localCount;
  };

  for (let i = 0; i < s.length; i++) {
    // Check for odd-length palindromes (single char center)
    count += countPalindromesAroundCenter(i, i);
    
    // Check for even-length palindromes (gap center)
    count += countPalindromesAroundCenter(i, i + 1);
  }

  return count;
}

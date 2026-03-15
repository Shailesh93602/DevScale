// Optimal approach: O(n) Time, O(1) Space
// Fibonacci-like DP with validity checks for 1-digit and 2-digit decodings
function numDecodings(s: string): number {
  if (s[0] === '0') return 0;
  const n = s.length;
  let prev2 = 1; // ways for empty prefix
  let prev1 = 1; // ways for first character

  for (let i = 1; i < n; i++) {
    let current = 0;
    // Single digit decode: s[i] must be '1'-'9'
    if (s[i] !== '0') {
      current += prev1;
    }
    // Two digit decode: s[i-1..i] must be '10'-'26'
    const twoDigit = parseInt(s.substring(i - 1, i + 1));
    if (twoDigit >= 10 && twoDigit <= 26) {
      current += prev2;
    }
    prev2 = prev1;
    prev1 = current;
  }

  return prev1;
}

// O(n) Time, O(1) Space — Incremental Parsing
function myAtoi(s: string): number {
  let i = 0;
  let sign = 1;
  let result = 0;
  const INT_MAX = 2147483647;
  const INT_MIN = -2147483648;

  while (i < s.length && s[i] === ' ') {
    i++;
  }

  if (i < s.length && (s[i] === '+' || s[i] === '-')) {
    sign = s[i] === '-' ? -1 : 1;
    i++;
  }

  while (i < s.length && s.charCodeAt(i) >= 48 && s.charCodeAt(i) <= 57) {
    result = result * 10 + (s.charCodeAt(i) - 48);

    if (sign === 1 && result > INT_MAX) return INT_MAX;
    if (sign === -1 && result > INT_MAX + 1) return INT_MIN;
    
    i++;
  }

  return result * sign;
}

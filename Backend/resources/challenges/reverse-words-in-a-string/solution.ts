// O(n) Time, O(n) Space — Built In Splitting & Reversing
function reverseWords(s: string): string {
  // \s+ represents one or more whitespace characters
  return s.trim().split(/\s+/).reverse().join(' ');
}

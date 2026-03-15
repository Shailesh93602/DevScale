// O(n) Time, O(1) Space — Left-to-Right Single Pass
function romanToInt(s: string): number {
  const romanMap: Record<string, number> = {
    'I': 1, 'V': 5, 'X': 10, 'L': 50, 
    'C': 100, 'D': 500, 'M': 1000
  };

  let total = 0;

  for (let i = 0; i < s.length; i++) {
    const currentVal = romanMap[s[i]];
    if (i < s.length - 1 && currentVal < romanMap[s[i + 1]]) {
      total -= currentVal;
    } else {
      total += currentVal;
    }
  }

  return total;
}

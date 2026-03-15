// Optimal O(N) Time, O(1) Space — Sliding window of fixed size with count map
function findAnagrams(s: string, p: string): number[] {
  const result: number[] = [];
  if (s.length < p.length) return result;

  const countP = new Array(26).fill(0);
  const countWindow = new Array(26).fill(0);

  const getIndex = (char: string) => char.charCodeAt(0) - 97;

  // Initialize both mapping frequencies 
  for (let i = 0; i < p.length; i++) {
    countP[getIndex(p[i])]++;
    countWindow[getIndex(s[i])]++;
  }

  // Optimized compare (checking 26 locations is O(1))
  const matches = () => {
    for (let i = 0; i < 26; i++) {
      if (countP[i] !== countWindow[i]) return false;
    }
    return true;
  };

  if (matches()) result.push(0);

  let left = 0;
  // Slide window by 1 each time
  for (let right = p.length; right < s.length; right++) {
    countWindow[getIndex(s[right])]++;
    countWindow[getIndex(s[left])]--;
    left++;

    if (matches()) result.push(left);
  }

  return result;
}

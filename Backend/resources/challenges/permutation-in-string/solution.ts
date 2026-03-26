function checkInclusion(s1: string, s2: string): boolean {
  if (s1.length > s2.length) return false;

  const s1Count = new Array(26).fill(0);
  const s2Count = new Array(26).fill(0);

  for (let i = 0; i < s1.length; i++) {
    s1Count[s1.charCodeAt(i) - 97]++;
    s2Count[s2.charCodeAt(i) - 97]++;
  }

  let matches = 0;
  for (let i = 0; i < 26; i++) {
    if (s1Count[i] === s2Count[i]) matches++;
  }

  for (let i = 0; i < s2.length - s1.length; i++) {
    if (matches === 26) return true;

    const rightChar = s2.charCodeAt(i + s1.length) - 97;
    s2Count[rightChar]++;
    if (s2Count[rightChar] === s1Count[rightChar]) {
      matches++;
    } else if (s2Count[rightChar] === s1Count[rightChar] + 1) {
      matches--;
    }

    const leftChar = s2.charCodeAt(i) - 97;
    s2Count[leftChar]--;
    if (s2Count[leftChar] === s1Count[leftChar]) {
      matches++;
    } else if (s2Count[leftChar] === s1Count[leftChar] - 1) {
      matches--;
    }
  }

  return matches === 26;
}

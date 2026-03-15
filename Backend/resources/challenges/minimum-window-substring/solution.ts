// O(m + n) Time, O(1) Space — Sliding window
function minWindow(s: string, t: string): string {
  if (t.length > s.length) return "";

  const countT = new Map<string, number>();
  for (const c of t) countT.set(c, (countT.get(c) || 0) + 1);

  const windowCounts = new Map<string, number>();
  let have = 0;
  let need = countT.size;

  let minLen = Infinity;
  let bestWindow = [-1, -1];

  let left = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    windowCounts.set(char, (windowCounts.get(char) || 0) + 1);

    if (countT.has(char) && windowCounts.get(char) === countT.get(char)) {
      have++;
    }

    while (have === need) {
      if ((right - left + 1) < minLen) {
        minLen = right - left + 1;
        bestWindow = [left, right];
      }

      const leftChar = s[left];
      windowCounts.set(leftChar, windowCounts.get(leftChar)! - 1);

      if (countT.has(leftChar) && windowCounts.get(leftChar)! < countT.get(leftChar)!) {
        have--;
      }
      left++;
    }
  }

  return minLen === Infinity ? "" : s.substring(bestWindow[0], bestWindow[1] + 1);
}

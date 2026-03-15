// Optimal O(N * K) Time, O(N * K) Space — Count Frequency Approach
function groupAnagrams(strs: string[]): string[][] {
  const map = new Map<string, string[]>();

  for (const s of strs) {
    const counts = new Array(26).fill(0);
    
    for (let i = 0; i < s.length; i++) {
        counts[s.charCodeAt(i) - 97]++; // 97 is charCode for 'a'
    }

    const key = counts.join('#');
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(s);
  }

  return Array.from(map.values());
}

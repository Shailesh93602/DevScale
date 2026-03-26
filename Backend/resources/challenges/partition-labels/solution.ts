function partitionLabels(s: string): number[] {
  const last: Record<string, number> = {};
  
  // Track the last index of each character
  for (let i = 0; i < s.length; i++) {
    last[s[i]] = i;
  }
  
  const result: number[] = [];
  let start = 0;
  let end = 0;
  
  for (let i = 0; i < s.length; i++) {
    // Extend the current partition's end to include the last occurrence of the current character
    end = Math.max(end, last[s[i]]);
    
    // If the current index reaches the end of the partition, cut it
    if (i === end) {
      result.push(i - start + 1);
      start = i + 1;
    }
  }
  
  return result;
}

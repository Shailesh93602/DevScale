// O(n) Time, O(n) Space — HashSet approach
function longestConsecutive(nums: number[]): number {
  const numSet = new Set<number>(nums);
  let longest = 0;

  for (const num of numSet) {
    // Only start counting from sequence starters
    if (!numSet.has(num - 1)) {
      let current = num;
      let length = 1;

      while (numSet.has(current + 1)) {
        current++;
        length++;
      }

      longest = Math.max(longest, length);
    }
  }

  return longest;
}

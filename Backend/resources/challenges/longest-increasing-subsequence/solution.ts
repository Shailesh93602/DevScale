// Optimal approach: O(n log n) Time, O(n) Space
// Patience sorting with binary search
function lengthOfLIS(nums: number[]): number {
  const tails: number[] = [];

  for (const num of nums) {
    // Binary search for the leftmost position where tails[pos] >= num
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (tails[mid] < num) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    // If lo === tails.length, num extends the longest subsequence
    // Otherwise, num replaces tails[lo] to keep the smallest tail
    tails[lo] = num;
  }

  return tails.length;
}

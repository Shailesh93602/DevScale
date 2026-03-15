// Optimal approach: O(n) Time, O(1) Space
// Split circular problem into two linear House Robber problems
function rob(nums: number[]): number {
  const n = nums.length;
  if (n === 1) return nums[0];
  if (n === 2) return Math.max(nums[0], nums[1]);

  function robRange(start: number, end: number): number {
    let prev2 = 0;
    let prev1 = 0;
    for (let i = start; i <= end; i++) {
      const current = Math.max(prev1, prev2 + nums[i]);
      prev2 = prev1;
      prev1 = current;
    }
    return prev1;
  }

  // Case 1: Rob from house 0 to n-2 (exclude last)
  // Case 2: Rob from house 1 to n-1 (exclude first)
  return Math.max(robRange(0, n - 2), robRange(1, n - 1));
}

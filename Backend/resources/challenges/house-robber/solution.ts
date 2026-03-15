// Optimal approach: O(n) Time, O(1) Space
// At each house, decide: rob it (prev2 + nums[i]) or skip it (prev1)
function rob(nums: number[]): number {
  let prev2 = 0; // max money up to i-2
  let prev1 = 0; // max money up to i-1
  for (const num of nums) {
    const current = Math.max(prev1, prev2 + num);
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}

// Optimal approach: O(target * n) Time, O(target) Space
// Bottom-up DP counting permutations that sum to target
function combinationSum4(nums: number[], target: number): number {
  const dp: number[] = new Array(target + 1).fill(0);
  dp[0] = 1; // one way to make sum 0: choose nothing

  for (let i = 1; i <= target; i++) {
    for (const num of nums) {
      if (num <= i) {
        dp[i] += dp[i - num];
      }
    }
  }

  return dp[target];
}

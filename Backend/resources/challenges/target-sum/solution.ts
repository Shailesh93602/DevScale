// Optimal approach: O(n * subsetSum) Time, O(subsetSum) Space
// Reduce to subset sum counting: find subsets that sum to (total + target) / 2
function findTargetSumWays(nums: number[], target: number): number {
  const total = nums.reduce((a, b) => a + b, 0);
  if ((total + target) % 2 !== 0 || Math.abs(target) > total) return 0;
  const subsetSum = (total + target) / 2;

  const dp: number[] = new Array(subsetSum + 1).fill(0);
  dp[0] = 1;

  for (const num of nums) {
    for (let j = subsetSum; j >= num; j--) {
      dp[j] += dp[j - num];
    }
  }

  return dp[subsetSum];
}

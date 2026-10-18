// Optimal approach: O(n^3) Time, O(n^2) Space
// Interval DP: think about which balloon to burst LAST in each range
function maxCoins(nums: number[]): number {
  const n = nums.length;
  const arr = [1, ...nums, 1]; // pad with virtual balloons of value 1
  const dp: number[][] = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0));

  // len = number of balloons in the interval
  for (let len = 1; len <= n; len++) {
    for (let left = 0; left <= n - len; left++) {
      const right = left + len + 1;
      for (let k = left + 1; k < right; k++) {
        // k is the last balloon burst in the open interval (left, right)
        dp[left][right] = Math.max(
          dp[left][right],
          dp[left][k] + arr[left] * arr[k] * arr[right] + dp[k][right]
        );
      }
    }
  }

  return dp[0][n + 1];
}

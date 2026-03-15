// Optimal solution: O(n) time, O(1) space — Greedy BFS-level approach
function jump(nums: number[]): number {
  let jumps = 0;
  let curEnd = 0;
  let farthest = 0;

  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === curEnd) {
      jumps++;
      curEnd = farthest;
      if (curEnd >= nums.length - 1) break;
    }
  }

  return jumps;
}

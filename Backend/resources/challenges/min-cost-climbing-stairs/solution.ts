// Optimal approach: O(n) Time, O(1) Space
function minCostClimbingStairs(cost: number[]): number {
  let prev2 = 0, prev1 = 0;
  for (let i = 2; i <= cost.length; i++) {
    const current = Math.min(prev1 + cost[i - 1], prev2 + cost[i - 2]);
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}

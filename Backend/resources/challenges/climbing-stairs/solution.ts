// Optimal approach: O(n) Time, O(1) Space
// Uses the Fibonacci recurrence: ways(n) = ways(n-1) + ways(n-2)
function climbStairs(n: number): number {
  if (n <= 2) return n;
  let prev2 = 1; // ways to reach step 1
  let prev1 = 2; // ways to reach step 2
  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}

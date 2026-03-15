/**
 * Optimal Solution: O(N) Time, O(1) extra space (excluding result).
 * DP Relation: count(i) = count(i >> 1) + (i % 2)
 */
export function countBits(n: number): number[] {
  const ans = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    // Number of bits in i is bits in (i/2) + last bit of i
    ans[i] = ans[i >> 1] + (i & 1);
  }
  return ans;
}

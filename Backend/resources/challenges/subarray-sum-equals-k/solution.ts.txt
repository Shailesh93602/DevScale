// Optimal O(n) Time, O(n) Space — Prefix Sum + HashMap
function subarraySum(nums: number[], k: number): number {
  const prefixCount = new Map<number, number>();
  prefixCount.set(0, 1);

  let count = 0;
  let currentSum = 0;

  for (const num of nums) {
    currentSum += num;
    count += prefixCount.get(currentSum - k) ?? 0;
    prefixCount.set(currentSum, (prefixCount.get(currentSum) ?? 0) + 1);
  }

  return count;
}

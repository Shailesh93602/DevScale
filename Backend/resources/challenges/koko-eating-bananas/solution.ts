// Optimal solution: O(n log m) time, O(1) space — Binary search on answer
function minEatingSpeed(piles: number[], h: number): number {
  let left = 1;
  let right = Math.max(...piles);

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    const hours = piles.reduce((sum, p) => sum + Math.ceil(p / mid), 0);

    if (hours <= h) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }

  return left;
}

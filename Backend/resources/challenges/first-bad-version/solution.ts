// Optimal solution: O(log n) time, O(1) space — Binary search for leftmost true
// isBadVersion is provided as an API
function firstBadVersion(n: number): number {
  let left = 1;
  let right = n;

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (isBadVersion(mid)) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }

  return left;
}

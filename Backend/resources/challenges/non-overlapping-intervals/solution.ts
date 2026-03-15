// Optimal solution: O(n log n) time, O(1) space — Greedy sort by end
function eraseOverlapIntervals(intervals: number[][]): number {
  intervals.sort((a, b) => a[1] - b[1]);
  let count = 1;
  let prevEnd = intervals[0][1];

  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i][0] >= prevEnd) {
      count++;
      prevEnd = intervals[i][1];
    }
  }

  return intervals.length - count;
}

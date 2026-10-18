// Optimal solution: O(n log n) time, O(n) space — Sweep line
function minMeetingRooms(intervals: number[][]): number {
  const starts = intervals.map(i => i[0]).sort((a, b) => a - b);
  const ends = intervals.map(i => i[1]).sort((a, b) => a - b);

  let rooms = 0;
  let maxRooms = 0;
  let s = 0;
  let e = 0;

  while (s < starts.length) {
    if (starts[s] < ends[e]) {
      rooms++;
      maxRooms = Math.max(maxRooms, rooms);
      s++;
    } else {
      rooms--;
      e++;
    }
  }

  return maxRooms;
}

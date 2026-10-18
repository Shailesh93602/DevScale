function findMinArrowShots(points: number[][]): number {
  if (points.length === 0) return 0;
  
  // Greedy choice: Sort by the end coordinate
  // This helps us greedily shoot arrows at the earliest possible end point
  // to maximize the number of overlapping balloons covered.
  points.sort((a, b) => a[1] - b[1]);
  
  let arrows = 1;
  let firstEnd = points[0][1];
  
  for (let [start, end] of points) {
    // If the current balloon starts AFTER the previous arrow's x-coordinate,
    // we need a new arrow.
    if (start > firstEnd) {
      arrows++;
      firstEnd = end;
    }
  }
  
  return arrows;
}


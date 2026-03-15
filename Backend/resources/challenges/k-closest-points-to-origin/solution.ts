// O(N log N) Time, O(1) Space — Sorting (Or O(N) using Quickselect)
// Sorting is fast enough here. Quickselect is optimal but more complex to write.
export function kClosest(points: number[][], k: number): number[][] {
  const getDistance = (point: number[]) => point[0] * point[0] + point[1] * point[1];

  points.sort((a, b) => getDistance(a) - getDistance(b));

  return points.slice(0, k);
}

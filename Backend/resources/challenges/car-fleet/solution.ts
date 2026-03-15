// Optimal solution: O(n log n) time, O(n) space — Sort + greedy
function carFleet(target: number, position: number[], speed: number[]): number {
  const n = position.length;
  const cars = position.map((p, i) => [p, (target - p) / speed[i]] as [number, number]);
  cars.sort((a, b) => b[0] - a[0]);

  let fleets = 0;
  let maxTime = 0;

  for (const [, time] of cars) {
    if (time > maxTime) {
      fleets++;
      maxTime = time;
    }
  }

  return fleets;
}

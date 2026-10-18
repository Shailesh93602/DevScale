// Optimal solution: O(n) time, O(1) space — Greedy single pass
function canCompleteCircuit(gas: number[], cost: number[]): number {
  let totalSurplus = 0;
  let currentSurplus = 0;
  let start = 0;

  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    totalSurplus += diff;
    currentSurplus += diff;

    if (currentSurplus < 0) {
      start = i + 1;
      currentSurplus = 0;
    }
  }

  return totalSurplus >= 0 ? start : -1;
}

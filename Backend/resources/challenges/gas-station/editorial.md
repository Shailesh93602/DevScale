# Editorial — Gas Station

## Problem Summary

Find the starting gas station index to complete a circular trip, or return -1 if impossible.

---

## Approach 1 — Brute Force (O(n^2) time, O(1) space)

Try starting from each station and simulate the trip.

```typescript
function canCompleteCircuit(gas: number[], cost: number[]): number {
  const n = gas.length;
  for (let start = 0; start < n; start++) {
    let tank = 0;
    let success = true;
    for (let i = 0; i < n; i++) {
      const idx = (start + i) % n;
      tank += gas[idx] - cost[idx];
      if (tank < 0) {
        success = false;
        break;
      }
    }
    if (success) return start;
  }
  return -1;
}
```

**Complexity:**
- Time: **O(n^2)** — try each starting point and simulate.
- Space: **O(1)**.

---

## Approach 2 — Greedy Single Pass (O(n) time, O(1) space) ✅ Optimal

Two key observations:
1. If `totalGas < totalCost`, no solution exists.
2. If we start at some station and the tank goes negative at station `j`, then no station between `start` and `j` can be the answer either. So we reset the start to `j + 1`.

```typescript
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
```

**Complexity:**
- Time: **O(n)** — single pass.
- Space: **O(1)** — three variables.

---

## Key Insight

If the total gas is at least the total cost, a solution is guaranteed to exist (given uniqueness). The greedy approach leverages the fact that if you can't reach station `j` starting from `start`, then no station between `start` and `j` works either, because they would have even less gas accumulated.

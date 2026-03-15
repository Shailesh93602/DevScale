# Editorial — Car Fleet

## Problem Summary

Count the number of car fleets arriving at the target, where faster cars behind slower ones merge into the slower car's fleet.

---

## Approach — Sort + Stack (O(n log n) time, O(n) space) ✅ Optimal

1. Pair each car's position with its time to reach target: `time = (target - position) / speed`.
2. Sort by position in descending order (closest to target first).
3. Use a stack (or just count). If a car takes longer than the car ahead, it forms a new fleet.

```typescript
function carFleet(target: number, position: number[], speed: number[]): number {
  const n = position.length;
  const cars = position.map((p, i) => [p, (target - p) / speed[i]] as [number, number]);
  cars.sort((a, b) => b[0] - a[0]); // sort by position descending

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
```

**Complexity:**
- Time: **O(n log n)** — sorting.
- Space: **O(n)** — sorted array.

---

## Key Insight

Process cars from closest to target. A car behind a slower car will merge into its fleet. We only need to check if a car's arrival time exceeds the current fleet's time. If so, it leads a new fleet.

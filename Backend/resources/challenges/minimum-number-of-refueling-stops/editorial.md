# Editorial — Minimum Number of Refueling Stops

## Approach: Greedy with Max-Heap (O(N log N) Time, O(N) Space)

The problem asks for the minimum stops required to reach the target distance `target`. We start with `startFuel` and face `N` gas stations along the way.

A naive greedy approach (stopping at every station) doesn't guarantee the *minimum* stops. A dynamic programming approach takes `O(N^2)` time. Can we do better? Yes, with a **Priority Queue (Max-Heap)**!

### The Trick: "Teleporting" Fuel
Imagine driving as far as you can until your fuel tank runs dry. 
- Along the way, you pass several gas stations. Since you don't know if you *need* them yet, you don't stop. 
- However, you take a "mental note" of how much fuel they had. You add their fuel capacity to a Max-Heap.
- When your car eventually runs out of gas, you look back at all the stations you passed (which are now in your Max-Heap).
- You "teleport" the largest tank of gas into your car. This counts as **1 stop**.
- Now you have enough fuel to drive further. You continue this process.
- If your tank is empty, and your Max-Heap is empty, you're stranded. Return `-1`.

```typescript
function minRefuelStops(target: number, startFuel: number, stations: number[][]): number {
  const maxHeap = new MaxHeap(); // MaxHeap of seen fuel reserves
  let currentFuel = startFuel;
  let stops = 0;
  let stationIndex = 0;

  // We are "driving" as long as we haven't reached the target
  while (currentFuel < target) {
    // Collect the fuel capacity of all stations we can mathematically reach right now
    while (stationIndex < stations.length && currentFuel >= stations[stationIndex][0]) {
      maxHeap.push(stations[stationIndex][1]);
      stationIndex++;
    }

    // We ran out of fuel (or can't reach the target). Look back at the stations we passed.
    if (maxHeap.size() === 0) return -1;

    // Use fuel from the largest ignored station
    currentFuel += maxHeap.pop(); 
    stops++;
  }

  return stops;
}
```

**Complexity:**
- **Time:** **O(N log N)** where `N` is the number of stations. Every station's fuel is pushed and popped from the Max-Heap exactly once in the worst case.
- **Space:** **O(N)** for the heap.

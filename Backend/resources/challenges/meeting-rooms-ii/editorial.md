# Editorial — Meeting Rooms II

## Problem Summary

Find the minimum number of conference rooms needed to hold all meetings without conflicts.

---

## Approach 1 — Chronological Ordering / Sweep Line (O(n log n) time, O(n) space) ✅ Optimal

Separate all start and end times. Sort them. Sweep through events: increment a counter for each start, decrement for each end. The maximum counter value is the answer.

```typescript
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
```

**Complexity:**
- Time: **O(n log n)** — sorting.
- Space: **O(n)** — separate start/end arrays.

---

## Approach 2 — Min-Heap (O(n log n) time, O(n) space)

Sort by start time. Use a min-heap to track the earliest ending meeting. For each meeting, if its start >= heap's minimum end, remove the top (reuse room). Always add the current meeting's end.

```typescript
function minMeetingRooms(intervals: number[][]): number {
  intervals.sort((a, b) => a[0] - b[0]);
  const heap: number[] = []; // min-heap of end times

  const push = (val: number) => {
    heap.push(val);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent] <= heap[i]) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  };

  const pop = () => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;
      while (true) {
        let smallest = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < heap.length && heap[l] < heap[smallest]) smallest = l;
        if (r < heap.length && heap[r] < heap[smallest]) smallest = r;
        if (smallest === i) break;
        [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
        i = smallest;
      }
    }
    return top;
  };

  for (const [start, end] of intervals) {
    if (heap.length > 0 && heap[0] <= start) {
      pop();
    }
    push(end);
  }

  return heap.length;
}
```

**Complexity:**
- Time: **O(n log n)** — sort + heap operations.
- Space: **O(n)** — heap.

---

## Key Insight

The sweep line approach treats the problem as counting the maximum number of overlapping events at any point in time. By processing starts and ends in chronological order, we find the peak overlap, which equals the minimum rooms needed.

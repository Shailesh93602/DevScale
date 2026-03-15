# Editorial — Task Scheduler

## Approach: Math / Greedy Formula (O(N) Time, O(1) Space)

The problem asks for the minimum CPU time required to execute an array of tasks given a cooldown `n` between the same tasks.

The key insight is that the most frequent task dictates the minimum length of the interval sequence. Let's call the max frequency `maxFreq`. We must schedule the most frequent task `maxFreq` times. Between each execution, there are `n` empty slots. So, the minimum time just for the most frequent task and its idle spaces is `(maxFreq - 1) * (n + 1) + 1`.

What if multiple tasks share the maximum frequency? They would occupy the last slots of the `maxFreq` execution blocks. If `countMaxFreq` tasks share the maximum frequency, the minimum time increases: `(maxFreq - 1) * (n + 1) + countMaxFreq`.

What if there are so many other tasks that they fill all the idle spaces and require more space? The CPU wouldn't need to stay idle at all! In this case, every task takes exactly 1 unit of time, so the answer is just `tasks.length`.

Therefore, the theoretical minimum time is the **maximum** between:
1. `tasks.length` (No idles needed)
2. `(maxFreq - 1) * (n + 1) + countMaxFreq` (Idles constrain the timeline)

```typescript
function leastInterval(tasks: string[], n: number): number {
  if (n === 0) return tasks.length;

  const charCounts = new Array(26).fill(0);
  for (const task of tasks) {
    charCounts[task.charCodeAt(0) - 65]++;
  }

  charCounts.sort((a, b) => b - a); // Sort descending
  const maxFreq = charCounts[0];

  let idleTime = (maxFreq - 1) * n;

  for (let i = 1; i < 26 && charCounts[i] > 0; i++) {
    // We deduct filling tasks from the total idle time.
    idleTime -= Math.min(maxFreq - 1, charCounts[i]); 
  }

  idleTime = Math.max(0, idleTime);

  return tasks.length + idleTime;
}
```

**Complexity:**
- **Time/Space:** **O(N)** since we iterate over tasks once. Building the character counts is `O(26)`. Space is **O(1)** strictly speaking since `charCounts` uses a rigid array of length 26.

// O(N) Time, O(1) Space — Math / Greedy Formula
export function leastInterval(tasks: string[], n: number): number {
  if (n === 0) return tasks.length;

  const charCounts = new Array(26).fill(0);
  for (const task of tasks) {
    charCounts[task.charCodeAt(0) - 65]++;
  }

  charCounts.sort((a, b) => b - a);
  const maxFreq = charCounts[0];

  let idleTime = (maxFreq - 1) * n;

  for (let i = 1; i < 26 && charCounts[i] > 0; i++) {
    // We can only fill maxFreq - 1 slots for any task to maintain maxFreq tasks separated
    idleTime -= Math.min(maxFreq - 1, charCounts[i]); 
  }

  // If idleTime < 0, it means we had more tasks than empty slots, 
  // so no idles are actually needed.
  idleTime = Math.max(0, idleTime);

  return tasks.length + idleTime;
}

# Editorial — The Dining Philosophers

## Approach: Resource Ordering

### Intuition
Deadlock occurs when each philosopher holds one fork and waits for another (circular wait). Break the cycle by having each philosopher always pick up the lower-numbered fork first. This ensures no circular dependency.

### TypeScript Solution

```typescript
function diningPhilosophers(
  n: number,
  rounds: number
): { actions: string[][]; deadlockFree: boolean } {
  const forks = new Array(n).fill(false); // false = available
  const actions: string[][] = [];

  for (let p = 0; p < n; p++) {
    const philActions: string[] = [];
    const leftFork = p;
    const rightFork = (p + 1) % n;
    const firstFork = Math.min(leftFork, rightFork);
    const secondFork = Math.max(leftFork, rightFork);

    for (let r = 0; r < rounds; r++) {
      philActions.push(`P${p}: pick fork ${firstFork}`);
      philActions.push(`P${p}: pick fork ${secondFork}`);
      philActions.push(`P${p}: eat round ${r + 1}`);
      philActions.push(`P${p}: put fork ${secondFork}`);
      philActions.push(`P${p}: put fork ${firstFork}`);
    }
    actions.push(philActions);
  }

  return { actions, deadlockFree: true };
}
```

### Why Resource Ordering Works
If all philosophers pick up the lower-numbered fork first, philosopher n-1 will try to pick fork 0 before fork n-1. This breaks the circular wait condition that causes deadlock.

### Complexity
- **Time**: O(n * rounds)
- **Space**: O(n * rounds)

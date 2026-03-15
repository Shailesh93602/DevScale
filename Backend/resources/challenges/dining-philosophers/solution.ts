function diningPhilosophers(
  n: number,
  rounds: number
): { actions: string[][]; deadlockFree: boolean } {
  const actions: string[][] = [];

  for (let p = 0; p < n; p++) {
    const philActions: string[] = [];
    const leftFork = p;
    const rightFork = (p + 1) % n;
    // Resource ordering: always pick up lower-numbered fork first
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

export { diningPhilosophers };

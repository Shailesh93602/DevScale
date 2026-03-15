# Editorial — Building H2O

## Approach: Counting Semaphore Pattern

### Intuition
Use counters for hydrogen and oxygen atoms. When 2 hydrogen and 1 oxygen are available, release them together as a molecule. Use promises to block atoms until a complete molecule can form.

### TypeScript Solution

```typescript
class H2O {
  private hCount = 0;
  private oCount = 0;
  private hQueue: (() => void)[] = [];
  private oQueue: (() => void)[] = [];

  private tryRelease() {
    if (this.hCount >= 2 && this.oCount >= 1) {
      this.hCount -= 2;
      this.oCount -= 1;
      this.hQueue.shift()!();
      this.hQueue.shift()!();
      this.oQueue.shift()!();
    }
  }

  async hydrogen(releaseHydrogen: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.hCount++;
      this.hQueue.push(() => {
        releaseHydrogen();
        resolve();
      });
      this.tryRelease();
    });
  }

  async oxygen(releaseOxygen: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.oCount++;
      this.oQueue.push(() => {
        releaseOxygen();
        resolve();
      });
      this.tryRelease();
    });
  }
}
```

### Complexity
- **Time**: O(1) per atom operation
- **Space**: O(n) for queued atoms

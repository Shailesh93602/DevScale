# Editorial — Print FooBar Alternately

## Approach: Promise Chain Synchronization

### Intuition
Use a flag or promise-based mechanism to alternate between foo and bar. Each function waits for its turn, executes, then signals the other.

### TypeScript Solution

```typescript
class FooBar {
  private n: number;
  private fooTurn: boolean = true;
  private resolve!: () => void;
  private wait: Promise<void>;

  constructor(n: number) {
    this.n = n;
    this.wait = new Promise(r => { this.resolve = r; });
  }

  async foo(printFoo: () => void): Promise<void> {
    for (let i = 0; i < this.n; i++) {
      while (!this.fooTurn) {
        await new Promise(r => setTimeout(r, 0));
      }
      printFoo();
      this.fooTurn = false;
    }
  }

  async bar(printBar: () => void): Promise<void> {
    for (let i = 0; i < this.n; i++) {
      while (this.fooTurn) {
        await new Promise(r => setTimeout(r, 0));
      }
      printBar();
      this.fooTurn = true;
    }
  }
}
```

### Complexity
- **Time**: O(n) per function
- **Space**: O(1)

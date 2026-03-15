# Editorial — Print in Order

## Approach: Promise-based Synchronization

### Intuition
Use promises as gates. Create promises that resolve when prior functions complete. `second` awaits the promise created by `first`, and `third` awaits the promise created by `second`.

### TypeScript Solution

```typescript
class OrderedPrinter {
  private firstDone: Promise<void>;
  private secondDone: Promise<void>;
  private resolveFirst!: () => void;
  private resolveSecond!: () => void;

  constructor() {
    this.firstDone = new Promise((resolve) => {
      this.resolveFirst = resolve;
    });
    this.secondDone = new Promise((resolve) => {
      this.resolveSecond = resolve;
    });
  }

  async first(printFirst: () => void): Promise<void> {
    printFirst();
    this.resolveFirst();
  }

  async second(printSecond: () => void): Promise<void> {
    await this.firstDone;
    printSecond();
    this.resolveSecond();
  }

  async third(printThird: () => void): Promise<void> {
    await this.secondDone;
    printThird();
  }
}
```

### Complexity
- **Time**: O(1) per function call
- **Space**: O(1)

# Editorial — FizzBuzz Multithreaded

## Approach: Shared Counter with State Dispatch

### Intuition
Use a shared counter and state to dispatch to the correct function. Each function checks if the current number matches its condition, processes it, then advances the counter.

### TypeScript Solution

```typescript
class FizzBuzzMT {
  private n: number;
  private current = 1;

  constructor(n: number) {
    this.n = n;
  }

  async fizz(printFizz: () => void): Promise<void> {
    while (this.current <= this.n) {
      if (this.current % 3 === 0 && this.current % 5 !== 0) {
        printFizz();
        this.current++;
      } else {
        await new Promise(r => setTimeout(r, 0));
      }
    }
  }

  async buzz(printBuzz: () => void): Promise<void> {
    while (this.current <= this.n) {
      if (this.current % 5 === 0 && this.current % 3 !== 0) {
        printBuzz();
        this.current++;
      } else {
        await new Promise(r => setTimeout(r, 0));
      }
    }
  }

  async fizzbuzz(printFizzBuzz: () => void): Promise<void> {
    while (this.current <= this.n) {
      if (this.current % 15 === 0) {
        printFizzBuzz();
        this.current++;
      } else {
        await new Promise(r => setTimeout(r, 0));
      }
    }
  }

  async number(printNumber: (n: number) => void): Promise<void> {
    while (this.current <= this.n) {
      if (this.current % 3 !== 0 && this.current % 5 !== 0) {
        printNumber(this.current);
        this.current++;
      } else {
        await new Promise(r => setTimeout(r, 0));
      }
    }
  }
}
```

### Complexity
- **Time**: O(n)
- **Space**: O(1)

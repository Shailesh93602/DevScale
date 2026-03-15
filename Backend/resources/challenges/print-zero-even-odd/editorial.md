# Editorial — Print Zero Even Odd

## Approach: State Machine with Promises

### Intuition
Use a state variable to track whose turn it is: zero, odd, or even. Zero prints before every number, alternating between odd and even numbers.

### TypeScript Solution

```typescript
class ZeroEvenOdd {
  private n: number;
  private state: number = 0; // 0=zero's turn, 1=odd's turn, 2=even's turn

  constructor(n: number) {
    this.n = n;
  }

  async zero(printZero: () => void): Promise<void> {
    for (let i = 1; i <= this.n; i++) {
      while (this.state !== 0) {
        await new Promise(r => setTimeout(r, 0));
      }
      printZero();
      this.state = i % 2 === 1 ? 1 : 2;
    }
  }

  async odd(printOdd: (n: number) => void): Promise<void> {
    for (let i = 1; i <= this.n; i += 2) {
      while (this.state !== 1) {
        await new Promise(r => setTimeout(r, 0));
      }
      printOdd(i);
      this.state = 0;
    }
  }

  async even(printEven: (n: number) => void): Promise<void> {
    for (let i = 2; i <= this.n; i += 2) {
      while (this.state !== 2) {
        await new Promise(r => setTimeout(r, 0));
      }
      printEven(i);
      this.state = 0;
    }
  }
}
```

### Complexity
- **Time**: O(n) per function
- **Space**: O(1)

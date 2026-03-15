# Editorial — Min Stack

## Problem Summary

Design a stack that supports O(1) push, pop, top, and getMin operations.

---

## Approach 1 — Two Stacks (O(1) per operation, O(n) space) ✅ Optimal

Use a main stack for values and a parallel min-stack that tracks the minimum at each level.

```typescript
class MinStack {
  private stack: number[] = [];
  private minStack: number[] = [];

  push(val: number): void {
    this.stack.push(val);
    const min = this.minStack.length === 0 ? val : Math.min(val, this.minStack[this.minStack.length - 1]);
    this.minStack.push(min);
  }

  pop(): void {
    this.stack.pop();
    this.minStack.pop();
  }

  top(): number {
    return this.stack[this.stack.length - 1];
  }

  getMin(): number {
    return this.minStack[this.minStack.length - 1];
  }
}
```

**Complexity:**
- Time: **O(1)** per operation.
- Space: **O(n)** — two stacks.

---

## Approach 2 — Single Stack with Pairs (O(1) per operation, O(n) space)

Store `[value, currentMin]` pairs in a single stack.

```typescript
class MinStack {
  private stack: [number, number][] = [];

  push(val: number): void {
    const min = this.stack.length === 0 ? val : Math.min(val, this.stack[this.stack.length - 1][1]);
    this.stack.push([val, min]);
  }

  pop(): void { this.stack.pop(); }
  top(): number { return this.stack[this.stack.length - 1][0]; }
  getMin(): number { return this.stack[this.stack.length - 1][1]; }
}
```

**Complexity:** Same as Approach 1.

---

## Key Insight

The trick is maintaining the minimum at every stack level. When you push, the new minimum is either the pushed value or the previous minimum. When you pop, the minimum for the remaining stack is already stored. This avoids scanning for the minimum.

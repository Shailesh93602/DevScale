# Editorial — Implement Curry Function

## Approach 1: Recursive Currying

### Intuition
Use a closure to accumulate arguments. Check if enough arguments have been collected based on `fn.length`. If yes, call the original function. If not, return a new function that collects more.

### Implementation

```typescript
function curry(fn: (...args: any[]) => any): (...args: any[]) => any {
  return function curried(...args: any[]): any {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...nextArgs: any[]) => curried(...args, ...nextArgs);
  };
}
```

### Complexity
- **Time**: O(n) where n is fn.length — each call creates a closure.
- **Space**: O(n) for accumulated arguments.

## Approach 2: Using bind

```typescript
function curry(fn: (...args: any[]) => any): (...args: any[]) => any {
  return function curried(this: any, ...args: any[]): any {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return curried.bind(this, ...args);
  };
}
```

## Key Concepts

1. **fn.length** — The number of expected parameters.
2. **Closures** — Accumulated args persist across calls.
3. **Partial application** — Each call returns a more-specific function.

## Common Pitfalls

- Not handling all-args-at-once case.
- Using `arguments` instead of rest params (loses proper length tracking).

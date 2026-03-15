# Editorial — Implement Debounce

## Approach 1: Basic Debounce with setTimeout/clearTimeout

### Intuition
The core idea is to use a closure to maintain a reference to a timer. Every time the debounced function is called, we clear the previous timer and set a new one. The original function only executes when the timer completes without being interrupted.

### Implementation

```typescript
function debounce(fn: (...args: any[]) => void, delay: number): (...args: any[]) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: any[]) {
    // Clear any existing timer
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Set a new timer
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, delay);
  };
}
```

### Complexity
- **Time**: O(1) per call — just clearing and setting a timer.
- **Space**: O(1) — stores one timer ID and the closure variables.

## Approach 2: Debounce with Cancel and Flush

### Intuition
A more feature-rich implementation adds `cancel()` to abort a pending invocation and `flush()` to execute it immediately.

### Implementation

```typescript
interface DebouncedFunction {
  (...args: any[]): void;
  cancel: () => void;
  flush: () => void;
}

function debounce(fn: (...args: any[]) => void, delay: number): DebouncedFunction {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: any[] | null = null;
  let lastThis: any = null;

  function invoke() {
    if (lastArgs !== null) {
      fn.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }
  }

  const debounced = function (this: any, ...args: any[]) {
    lastArgs = args;
    lastThis = this;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      invoke();
      timeoutId = null;
    }, delay);
  } as DebouncedFunction;

  debounced.cancel = function () {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = function () {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    invoke();
  };

  return debounced;
}
```

### Complexity
- **Time**: O(1) per operation.
- **Space**: O(n) where n is the number of arguments stored.

## Key Concepts

1. **Closures** — The timer ID is captured in a closure, persisting across calls.
2. **clearTimeout/setTimeout** — Used together to reset the delay window.
3. **`this` binding** — `fn.apply(this, args)` ensures the debounced function preserves context.
4. **Arguments forwarding** — Rest/spread syntax passes all arguments through.

## Common Pitfalls

- Forgetting to clear the previous timeout before setting a new one.
- Not forwarding `this` context — using arrow functions inside the returned function loses the caller's context.
- Not forwarding arguments properly.

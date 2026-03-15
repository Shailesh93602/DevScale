# Editorial — Implement Promise.all

## Approach: Counter-Based Resolution

### Intuition
Iterate over all promises. For each one, resolve it using `Promise.resolve()` (to handle plain values). Track resolved count. When all have resolved, resolve the outer promise with the collected results. If any rejects, immediately reject the outer promise.

### Implementation

```typescript
function promiseAll<T>(promises: Array<T | Promise<T>>): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      resolve([]);
      return;
    }

    const results: T[] = new Array(promises.length);
    let resolvedCount = 0;

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        (value) => {
          results[index] = value;
          resolvedCount++;
          if (resolvedCount === promises.length) {
            resolve(results);
          }
        },
        (reason) => {
          reject(reason);
        }
      );
    });
  });
}
```

### Complexity
- **Time**: O(n) to set up handlers, where n = number of promises.
- **Space**: O(n) for the results array.

## Key Concepts

1. **Promise.resolve()** wrapping — Ensures plain values are handled as resolved promises.
2. **Index-based storage** — `results[index] = value` preserves order regardless of resolution timing.
3. **Counter pattern** — Tracking `resolvedCount` determines when all promises have finished.
4. **Early rejection** — The first rejection immediately rejects the outer promise.

## Common Pitfalls

- Using `push()` instead of `results[index]` — loses order since promises resolve in arbitrary order.
- Not handling plain (non-promise) values.
- Not handling empty array input.
- Forgetting that `reject` can be called multiple times but only the first matters.

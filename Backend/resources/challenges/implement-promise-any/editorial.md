# Editorial — Implement Promise.any

## Approach: Counter-Based Rejection Collection

### Intuition
The mirror image of Promise.all. Instead of collecting resolved values and failing fast on rejection, we resolve fast on the first success and collect rejections. When all have rejected, create an AggregateError.

### Implementation

```typescript
function promiseAny<T>(promises: Array<T | Promise<T>>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }

    const errors: any[] = new Array(promises.length);
    let rejectedCount = 0;

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        (value) => {
          resolve(value); // First success wins
        },
        (reason) => {
          errors[index] = reason;
          rejectedCount++;
          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        }
      );
    });
  });
}
```

### Complexity
- **Time**: O(n) to set up handlers.
- **Space**: O(n) for the errors array.

## Key Concepts

1. **Inverse of Promise.all** — Succeeds on first success, fails when all fail.
2. **AggregateError** — ES2021 error type that holds an array of errors.
3. **Early resolution** — The first promise to resolve immediately resolves the outer promise.
4. **Order-preserving errors** — `errors[index]` maintains the original order.

## Common Pitfalls

- Not handling empty arrays (should reject, not hang).
- Using push instead of index assignment for errors.
- Forgetting to wrap plain values with Promise.resolve().

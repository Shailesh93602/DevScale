# Implement Promise.all

## Problem Description

Implement a `promiseAll` function that behaves like `Promise.all`. It takes an array of promises (or plain values) and returns a single promise that:
- **Resolves** with an array of results when ALL input promises resolve, maintaining the original order.
- **Rejects** immediately when ANY input promise rejects, with that rejection reason.

## Function Signature

```typescript
function promiseAll<T>(promises: Array<T | Promise<T>>): Promise<T[]>
```

## Parameters

- `promises` — An array of promises or plain values.

## Returns

A promise that resolves to an array of resolved values in the same order as the input.

## Examples

### Example 1
```typescript
const result = await promiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]);
// [1, 2, 3]
```

### Example 2
```typescript
const result = await promiseAll([1, 2, 3]);
// [1, 2, 3]  (plain values are treated as resolved)
```

### Example 3
```typescript
try {
  await promiseAll([
    Promise.resolve(1),
    Promise.reject('error'),
    Promise.resolve(3)
  ]);
} catch (e) {
  console.log(e); // 'error'
}
```

### Example 4
```typescript
const result = await promiseAll([]);
// []  (empty input resolves to empty array)
```

## Constraints

- Results must maintain the same order as the input array
- Non-promise values should be treated as `Promise.resolve(value)`
- Rejects immediately on the first rejection
- Empty array resolves to empty array

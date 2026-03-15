# Implement Promise.any

## Problem Description

Implement a `promiseAny` function that behaves like `Promise.any`. It takes an array of promises and returns a single promise that:
- **Resolves** with the value of the first promise that fulfills.
- **Rejects** with an `AggregateError` containing all rejection reasons if ALL promises reject.

This is the inverse of `Promise.all` — it succeeds if *any* promise succeeds.

## Function Signature

```typescript
function promiseAny<T>(promises: Array<T | Promise<T>>): Promise<T>
```

## Parameters

- `promises` — An array of promises or plain values.

## Returns

A promise that resolves with the first fulfilled value.

## Examples

### Example 1
```typescript
const result = await promiseAny([
  Promise.reject('error1'),
  Promise.resolve(42),
  Promise.resolve(100)
]);
// 42 (first to resolve)
```

### Example 2
```typescript
try {
  await promiseAny([
    Promise.reject('a'),
    Promise.reject('b'),
    Promise.reject('c')
  ]);
} catch (e) {
  // AggregateError with errors: ['a', 'b', 'c']
}
```

### Example 3
```typescript
const result = await promiseAny([1, Promise.reject('err'), 3]);
// 1 (plain value resolves immediately)
```

## Constraints

- Resolves with the first fulfilled value
- If all reject, rejects with an AggregateError containing all reasons
- Plain values are treated as resolved promises
- Empty array rejects with AggregateError (no promises can fulfill)

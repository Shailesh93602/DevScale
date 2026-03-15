# Memoize Function

## Problem Description

Implement a `memoize` function that caches the result of a function call based on its arguments. If the function is called again with the same arguments, the cached result should be returned without re-executing the function.

## Function Signature

```typescript
function memoize<T extends (...args: any[]) => any>(fn: T): T
```

## Parameters

- `fn` — The function to memoize.

## Returns

A memoized version of the function. Repeated calls with the same arguments return the cached result.

## Examples

### Example 1
```typescript
let callCount = 0;
const add = (a: number, b: number) => { callCount++; return a + b; };
const memoizedAdd = memoize(add);

memoizedAdd(1, 2); // 3, callCount = 1
memoizedAdd(1, 2); // 3, callCount = 1 (cached)
memoizedAdd(2, 3); // 5, callCount = 2 (new args)
```

### Example 2
```typescript
const factorial = memoize((n: number): number => {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
});

factorial(5); // 120 — each sub-call is cached
factorial(3); // 6 (already cached from factorial(5))
```

### Example 3
```typescript
const fetchUser = memoize(async (id: string) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});

await fetchUser("123"); // Network call
await fetchUser("123"); // Cached — no network call
```

## Constraints

- Arguments can be any type (numbers, strings, objects, etc.)
- For simplicity, you may use `JSON.stringify` for cache key generation
- The function should work with any number of arguments

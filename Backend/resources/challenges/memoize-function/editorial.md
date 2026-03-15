# Editorial — Memoize Function

## Approach 1: Map with JSON Key

### Intuition
Use a Map (or plain object) to cache results. Serialize the arguments to a string key using `JSON.stringify`.

### Implementation

```typescript
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, any>();

  return function (this: any, ...args: any[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  } as T;
}
```

### Complexity
- **Time**: O(1) amortized lookup, O(k) for key serialization where k = args size.
- **Space**: O(n) where n is number of unique argument combinations cached.

## Approach 2: Single-Argument Optimization

For functions that take a single primitive argument, use the argument directly as the key.

```typescript
function memoizeSingle(fn: (arg: any) => any) {
  const cache = new Map();
  return function (arg: any) {
    if (cache.has(arg)) return cache.get(arg);
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}
```

## Approach 3: WeakMap for Object Arguments

For functions that take object arguments, use a WeakMap to allow garbage collection.

```typescript
function memoizeWeak(fn: (obj: object) => any) {
  const cache = new WeakMap();
  return function (obj: object) {
    if (cache.has(obj)) return cache.get(obj);
    const result = fn(obj);
    cache.set(obj, result);
    return result;
  };
}
```

## Common Pitfalls

- Not handling multiple arguments — only caching based on the first argument.
- Using object references as keys directly (objects with same content but different references miss the cache).
- Not considering memory growth — cache grows unbounded without eviction.
- JSON.stringify fails with circular references or loses undefined values.

# Implement Debounce

## Problem Description

Implement a `debounce` function that delays invoking the provided function until after `delay` milliseconds have elapsed since the last time the debounced function was invoked.

Debouncing is a common technique used in web development to limit the rate at which a function fires. It is particularly useful for handling events that fire rapidly, such as `keyup`, `scroll`, or `resize`.

## Function Signature

```typescript
function debounce(fn: (...args: any[]) => void, delay: number): (...args: any[]) => void
```

## Parameters

- `fn` — The function to debounce.
- `delay` — The number of milliseconds to delay.

## Returns

A new debounced function. Each time the debounced function is called, it resets the timer. The original function `fn` is only called once the debounced function stops being called for `delay` milliseconds.

## Examples

### Example 1
```typescript
let count = 0;
const increment = debounce(() => { count++; }, 100);

increment(); // Timer starts
increment(); // Timer resets
increment(); // Timer resets
// After 100ms of no calls, count becomes 1
```

### Example 2
```typescript
const log = debounce((msg: string) => console.log(msg), 200);

log("a"); // Timer starts
log("b"); // Timer resets — "a" is never logged
// After 200ms: logs "b"
```

### Example 3
```typescript
const search = debounce((query: string) => fetchResults(query), 300);

// User types "react" quickly:
search("r");
search("re");
search("rea");
search("reac");
search("react");
// Only fetchResults("react") is called after 300ms pause
```

## Constraints

- `0 <= delay <= 10000`
- `fn` is a valid callable function
- The debounced function must forward all arguments to `fn`
- The debounced function must maintain the correct `this` context

# Implement Throttle

## Problem Description

Implement a `throttle` function that limits the rate at which a function can fire. The throttled function will only invoke the original function at most once per every `interval` milliseconds.

Unlike debounce (which delays execution until activity stops), throttle guarantees that the function fires at a regular interval during continuous activity.

## Function Signature

```typescript
function throttle(fn: (...args: any[]) => void, interval: number): (...args: any[]) => void
```

## Parameters

- `fn` — The function to throttle.
- `interval` — The minimum time in milliseconds between invocations.

## Returns

A throttled function. The first call executes immediately. Subsequent calls during the interval are ignored, but the last call in a series will fire after the interval elapses.

## Examples

### Example 1
```typescript
let count = 0;
const increment = throttle(() => { count++; }, 100);

increment(); // Executes immediately, count = 1
increment(); // Ignored (within 100ms)
increment(); // Ignored (within 100ms)
// After 100ms: trailing call fires, count = 2
```

### Example 2
```typescript
const log = throttle((msg: string) => console.log(msg), 200);

log("a"); // Logs "a" immediately
// 50ms later
log("b"); // Saved as trailing call
// 100ms later
log("c"); // Replaces trailing call
// At 200ms: logs "c" (trailing)
```

### Example 3
```typescript
const onScroll = throttle(updatePosition, 16); // ~60fps
window.addEventListener('scroll', onScroll);
// updatePosition fires at most once every 16ms during scrolling
```

## Constraints

- `0 <= interval <= 10000`
- `fn` is a valid callable function
- The throttled function must forward all arguments to `fn`
- The first invocation should execute immediately (leading edge)
- The last call should also fire after the interval (trailing edge)

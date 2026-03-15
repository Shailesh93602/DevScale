# Editorial — Implement Throttle

## Approach 1: Leading + Trailing Edge Throttle

### Intuition
Track the last time the function was called. If enough time has passed, execute immediately. Otherwise, schedule a trailing call for when the interval expires.

### Implementation

```typescript
function throttle(fn: (...args: any[]) => void, interval: number): (...args: any[]) => void {
  let lastCallTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: any[] | null = null;
  let lastThis: any = null;

  return function (this: any, ...args: any[]) {
    const now = Date.now();
    const remaining = interval - (now - lastCallTime);

    lastArgs = args;
    lastThis = this;

    if (remaining <= 0) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCallTime = now;
      fn.apply(this, args);
    } else if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        timeoutId = null;
        fn.apply(lastThis, lastArgs!);
        lastArgs = null;
        lastThis = null;
      }, remaining);
    }
  };
}
```

### Complexity
- **Time**: O(1) per call.
- **Space**: O(1).

## Approach 2: Simple Leading-Edge-Only Throttle

### Implementation

```typescript
function throttleSimple(fn: (...args: any[]) => void, interval: number): (...args: any[]) => void {
  let isThrottled = false;

  return function (this: any, ...args: any[]) {
    if (isThrottled) return;
    fn.apply(this, args);
    isThrottled = true;
    setTimeout(() => { isThrottled = false; }, interval);
  };
}
```

### Complexity
- **Time**: O(1) per call.
- **Space**: O(1).

## Throttle vs Debounce

| Feature | Throttle | Debounce |
|---------|----------|----------|
| Fires during activity | Yes, at intervals | No |
| First call | Immediate | Delayed |
| Use case | Scroll, resize | Search, form input |

## Common Pitfalls

- Not handling trailing calls — the last call in a burst gets lost.
- Using only leading edge, missing the final state update.
- Not clearing pending timeouts when a leading-edge call fires.

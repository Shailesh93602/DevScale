# Implement React useEffect Hook

## Problem Description

Implement a simplified version of React's `useEffect` hook. Your implementation should:
- Run the effect callback after each render when dependencies change
- Support cleanup functions returned by the effect
- Handle three dependency modes: no deps (run every render), empty array (run once), deps array (run when deps change)

## Function Signature

```typescript
function useEffect(effect: () => void | (() => void), deps?: any[]): void
```

## Parameters

- `effect` — A function to run as a side effect. May return a cleanup function.
- `deps` (optional) — An array of dependencies. Effect re-runs when any dependency changes.

## Behavior

| `deps` argument | When effect runs |
|-----------------|-----------------|
| Not provided | After every render |
| `[]` (empty) | Only after first render |
| `[a, b]` | When `a` or `b` change (shallow comparison) |

## Examples

### Example 1
```typescript
const { useState, useEffect, render } = createHooksSystem();

function Timer() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log('Count changed:', count);
    return () => console.log('Cleanup for:', count);
  }, [count]);
  return { count, increment: () => setCount(count + 1) };
}
```

### Example 2 — Run Once
```typescript
function App() {
  useEffect(() => {
    console.log('Mounted');
    return () => console.log('Unmounted');
  }, []);
}
```

### Example 3 — Run Every Render
```typescript
function Logger() {
  useEffect(() => {
    console.log('Rendered');
  });
}
```

## Constraints

- Dependencies compared using `Object.is` (shallow equality)
- Cleanup runs before the next effect execution
- Effects run in the order they are declared
- Must integrate with the hooks system (state array + index pattern)

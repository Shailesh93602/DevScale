# Implement React useState Hook

## Problem Description

Implement a simplified version of React's `useState` hook. Your implementation should maintain state across "re-renders" (repeated function calls) and support both direct value updates and functional updates.

You will need to implement a mini hooks system that tracks state across calls.

## Function Signature

```typescript
function useState<T>(initialValue: T): [T, (newValue: T | ((prev: T) => T)) => void]
```

## Parameters

- `initialValue` — The initial state value (used only on the first render).

## Returns

A tuple `[state, setState]` where:
- `state` — The current state value.
- `setState` — A function to update the state. Accepts either a new value or an updater function `(prevState) => newState`.

## Requirements

You also need to implement:
- `createHooksSystem()` — Returns `{ useState, render }` where `render(component)` simulates rendering.
- The hooks system must track state per call position (hook index).
- `setState` should trigger a re-render.

## Examples

### Example 1
```typescript
const { useState, render } = createHooksSystem();

function Counter() {
  const [count, setCount] = useState(0);
  return { count, increment: () => setCount(count + 1) };
}

let result = render(Counter);
console.log(result.count); // 0
result.increment();
result = render(Counter);
console.log(result.count); // 1
```

### Example 2 — Functional Updates
```typescript
function Counter() {
  const [count, setCount] = useState(0);
  return {
    count,
    incrementBy: (n: number) => setCount(prev => prev + n)
  };
}
```

### Example 3 — Multiple State Hooks
```typescript
function Form() {
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  return { name, age, setName, setAge };
}
```

## Constraints

- State persists across re-renders (calls to the component function)
- Multiple useState calls in one component are tracked by call order
- setState accepts a direct value or updater function
- Initial value is only used on the first render

# Editorial — Implement React useState Hook

## Approach: Hooks System with State Array

### Intuition
React tracks hooks by their call order within a component. We simulate this with an array of state values and a cursor (index) that resets at the start of each render. Each `useState` call reads/writes to the current index and increments it.

### Implementation

```typescript
function createHooksSystem() {
  let states: any[] = [];
  let hookIndex = 0;

  function useState<T>(initialValue: T): [T, (newValue: T | ((prev: T) => T)) => void] {
    const currentIndex = hookIndex;

    // Initialize state on first render
    if (currentIndex >= states.length) {
      states[currentIndex] = initialValue;
    }

    const state = states[currentIndex] as T;

    const setState = (newValue: T | ((prev: T) => T)) => {
      if (typeof newValue === 'function') {
        states[currentIndex] = (newValue as (prev: T) => T)(states[currentIndex]);
      } else {
        states[currentIndex] = newValue;
      }
    };

    hookIndex++;
    return [state, setState];
  }

  function render<T>(component: () => T): T {
    hookIndex = 0; // Reset cursor for each render
    return component();
  }

  return { useState, render };
}
```

### Complexity
- **Time**: O(1) per useState call.
- **Space**: O(n) where n is total number of state hooks.

## Key Concepts

1. **Call-order tracking** — Hooks must be called in the same order every render. The index maps each call to its state slot.
2. **Closure over index** — `setState` captures `currentIndex`, ensuring it always updates the correct slot.
3. **Functional updates** — `setState(prev => prev + 1)` allows updates based on previous state.
4. **Reset on render** — `hookIndex = 0` at the start of each render ensures hooks align with their state.

## Why Hooks Have Rules

This implementation shows why React's "Rules of Hooks" exist:
- **No hooks in conditionals** — Would change the call order, misaligning indexes.
- **No hooks in loops** — Same issue.
- **Always call at top level** — Guarantees consistent ordering.

## Common Pitfalls

- Not resetting the hook index between renders.
- Not handling functional updates (`setState(prev => ...)`)
- Using a single variable instead of an array (breaks with multiple useState calls).

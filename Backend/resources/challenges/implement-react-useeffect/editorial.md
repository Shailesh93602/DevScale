# Editorial — Implement React useEffect Hook

## Approach: Dependency Tracking with Cleanup

### Intuition
Store each effect's previous dependencies and cleanup function. On each render, compare current deps with previous deps. If they differ (or no deps provided), run the cleanup from the previous effect and then run the new effect.

### Implementation

```typescript
interface EffectEntry {
  deps: any[] | undefined;
  cleanup: (() => void) | void;
}

function createHooksSystem() {
  let states: any[] = [];
  let effects: EffectEntry[] = [];
  let hookIndex = 0;
  let effectIndex = 0;

  function useState<T>(initialValue: T): [T, (v: T | ((p: T) => T)) => void] {
    const idx = hookIndex;
    if (idx >= states.length) states[idx] = initialValue;
    const state = states[idx] as T;
    const setState = (v: T | ((p: T) => T)) => {
      states[idx] = typeof v === 'function' ? (v as Function)(states[idx]) : v;
    };
    hookIndex++;
    return [state, setState];
  }

  function useEffect(effect: () => void | (() => void), deps?: any[]): void {
    const idx = effectIndex;
    const prevEffect = effects[idx];

    let shouldRun = false;

    if (!prevEffect) {
      // First render — always run
      shouldRun = true;
    } else if (deps === undefined) {
      // No deps — run every render
      shouldRun = true;
    } else if (prevEffect.deps === undefined) {
      shouldRun = true;
    } else {
      // Compare deps
      shouldRun = deps.length !== prevEffect.deps.length ||
        deps.some((dep, i) => !Object.is(dep, prevEffect.deps![i]));
    }

    if (shouldRun) {
      // Run previous cleanup
      if (prevEffect?.cleanup) {
        prevEffect.cleanup();
      }
      // Run new effect
      const cleanup = effect();
      effects[idx] = { deps, cleanup };
    }

    effectIndex++;
  }

  function render<T>(component: () => T): T {
    hookIndex = 0;
    effectIndex = 0;
    return component();
  }

  return { useState, useEffect, render };
}
```

### Complexity
- **Time**: O(d) per useEffect where d is number of dependencies to compare.
- **Space**: O(e) where e is total number of effects.

## Key Concepts

1. **Dependency comparison** — Uses `Object.is` for shallow equality (same as React).
2. **Cleanup pattern** — The effect returns a cleanup function that runs before the next effect.
3. **Index-based tracking** — Like useState, effects are tracked by call order.
4. **Three modes** — No deps (always run), empty deps (run once), deps array (run on change).

## Common Pitfalls

- Not running cleanup before re-running the effect.
- Using `===` instead of `Object.is` (fails for NaN).
- Not handling the "no deps" case (should run every render).
- Confusing "no deps" (undefined) with "empty deps" ([]).

/**
 * Implement React useEffect Hook
 *
 * Tracks effects by call order, compares dependencies,
 * and runs cleanup before re-executing changed effects.
 *
 * Time: O(d) per useEffect (d = dependency count)
 * Space: O(e) for e total effects
 */
interface EffectEntry {
  deps: any[] | undefined;
  cleanup: (() => void) | void;
}

function createHooksSystem() {
  const states: any[] = [];
  const effects: EffectEntry[] = [];
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
      // Shallow compare each dependency
      shouldRun = deps.length !== prevEffect.deps.length ||
        deps.some((dep, i) => !Object.is(dep, prevEffect.deps![i]));
    }

    if (shouldRun) {
      // Run previous cleanup if it exists
      if (prevEffect?.cleanup) {
        prevEffect.cleanup();
      }
      // Run the effect and store its cleanup
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

export { createHooksSystem };

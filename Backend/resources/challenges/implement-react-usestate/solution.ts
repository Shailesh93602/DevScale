/**
 * Implement React useState Hook
 *
 * A simplified hooks system that tracks state by call order,
 * supporting multiple useState calls and functional updates.
 *
 * Time: O(1) per useState call
 * Space: O(n) for n state hooks
 */
function createHooksSystem() {
  let states: any[] = [];
  let hookIndex = 0;

  function useState<T>(initialValue: T): [T, (newValue: T | ((prev: T) => T)) => void] {
    const currentIndex = hookIndex;

    // Initialize on first render
    if (currentIndex >= states.length) {
      states[currentIndex] = initialValue;
    }

    const state = states[currentIndex] as T;

    // setState captures currentIndex via closure
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
    // Reset cursor so hooks align with their state slots
    hookIndex = 0;
    return component();
  }

  return { useState, render };
}

export { createHooksSystem };

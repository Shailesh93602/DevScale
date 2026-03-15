# Editorial — Implement an Event Emitter

## Approach: Map of Event Listeners

### Intuition
Use a Map (or plain object) where keys are event names and values are arrays of callback functions. Each method manipulates this structure.

### Implementation

```typescript
class EventEmitter {
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (...args: any[]) => void): void {
    const cbs = this.listeners.get(event);
    if (!cbs) return;
    const index = cbs.indexOf(callback);
    if (index !== -1) {
      cbs.splice(index, 1);
    }
  }

  emit(event: string, ...args: any[]): void {
    const cbs = this.listeners.get(event);
    if (!cbs) return;
    // Iterate over a copy to handle modifications during emit
    for (const cb of [...cbs]) {
      cb(...args);
    }
  }

  once(event: string, callback: (...args: any[]) => void): void {
    const wrapper = (...args: any[]) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}
```

### Complexity
- **on**: O(1) amortized.
- **off**: O(n) where n is number of listeners for that event.
- **emit**: O(n) where n is number of listeners.
- **once**: O(1) to register, O(n) for the auto-unsubscribe.
- **Space**: O(total listeners).

## Key Concepts

1. **Pub/Sub pattern** — Decouples event producers from consumers.
2. **Listener array copy during emit** — Prevents issues when listeners modify the list during iteration.
3. **Wrapper function for once** — Creates a self-removing listener.

## Common Pitfalls

- Not copying the listener array before iterating in `emit` — if a listener calls `off`, the iteration breaks.
- Comparing functions by value instead of reference in `off`.
- Not handling the case where `emit` is called for an event with no listeners.

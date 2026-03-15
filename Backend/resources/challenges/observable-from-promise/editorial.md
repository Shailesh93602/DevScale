# Editorial — Implement Observable from Promise

## Approach: Lazy Subscription with Safety Guards

### Intuition
An Observable wraps a subscribe function that is only called when someone subscribes. We add safety: once complete/error is called, no more values are emitted. Operators (map, filter) create new Observables that transform values in the chain.

### Implementation

```typescript
interface Observer<T> {
  next: (value: T) => void;
  error?: (err: any) => void;
  complete?: () => void;
}

interface Subscription {
  unsubscribe: () => void;
}

class Observable<T> {
  private subscribeFn: (observer: Observer<T>) => void | (() => void);

  constructor(subscribeFn: (observer: Observer<T>) => void | (() => void)) {
    this.subscribeFn = subscribeFn;
  }

  subscribe(observer: Observer<T>): Subscription {
    let isUnsubscribed = false;
    let isComplete = false;

    const safeObserver: Observer<T> = {
      next: (value: T) => {
        if (!isUnsubscribed && !isComplete) {
          observer.next(value);
        }
      },
      error: (err: any) => {
        if (!isUnsubscribed && !isComplete) {
          isComplete = true;
          observer.error?.(err);
        }
      },
      complete: () => {
        if (!isUnsubscribed && !isComplete) {
          isComplete = true;
          observer.complete?.();
        }
      }
    };

    const cleanup = this.subscribeFn(safeObserver);

    return {
      unsubscribe: () => {
        isUnsubscribed = true;
        if (typeof cleanup === 'function') cleanup();
      }
    };
  }

  map<U>(transform: (value: T) => U): Observable<U> {
    return new Observable<U>(observer => {
      const sub = this.subscribe({
        next: (value) => observer.next(transform(value)),
        error: (err) => observer.error?.(err),
        complete: () => observer.complete?.()
      });
      return () => sub.unsubscribe();
    });
  }

  filter(predicate: (value: T) => boolean): Observable<T> {
    return new Observable<T>(observer => {
      const sub = this.subscribe({
        next: (value) => { if (predicate(value)) observer.next(value); },
        error: (err) => observer.error?.(err),
        complete: () => observer.complete?.()
      });
      return () => sub.unsubscribe();
    });
  }
}

function fromPromise<T>(promise: Promise<T>): Observable<T> {
  return new Observable<T>(observer => {
    promise.then(
      (value) => {
        observer.next(value);
        observer.complete?.();
      },
      (err) => {
        observer.error?.(err);
      }
    );
  });
}
```

### Complexity
- **subscribe**: O(1) setup.
- **map/filter**: O(1) to create, O(n) during emission where n = values emitted.
- **Space**: O(1) per operator in the chain.

## Key Concepts

1. **Lazy execution** — The subscribe function only runs when `subscribe()` is called.
2. **Safe observer** — Wraps the observer to prevent emissions after complete/unsubscribe.
3. **Operator chaining** — Each operator returns a new Observable that subscribes to the source.
4. **Cleanup** — The subscribe function can return a teardown function.

## Common Pitfalls

- Emitting values after complete or unsubscribe.
- Not forwarding errors through operator chains.
- Making operators eager (executing immediately instead of lazily).

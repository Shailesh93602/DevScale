# Implement Observable from Promise

## Problem Description

Implement a minimal Observable class (inspired by RxJS) and a `fromPromise` factory function. The Observable should support subscribing with next/error/complete callbacks, and basic operators like map and filter.

## Interfaces

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
  constructor(subscribeFn: (observer: Observer<T>) => void | (() => void));
  subscribe(observer: Observer<T>): Subscription;
  map<U>(transform: (value: T) => U): Observable<U>;
  filter(predicate: (value: T) => boolean): Observable<T>;
}

function fromPromise<T>(promise: Promise<T>): Observable<T>
```

## Methods

- `constructor(subscribeFn)` — Takes a function that receives an observer and can return a cleanup function.
- `subscribe(observer)` — Starts the observable, returns a Subscription with `unsubscribe`.
- `map(transform)` — Returns a new Observable that transforms each emitted value.
- `filter(predicate)` — Returns a new Observable that only emits values passing the predicate.
- `fromPromise(promise)` — Creates an Observable that emits the promise result, then completes. On rejection, calls error.

## Examples

### Example 1 — Basic Observable
```typescript
const obs = new Observable<number>(observer => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
});

obs.subscribe({
  next: v => console.log(v),  // 1, 2, 3
  complete: () => console.log('done')
});
```

### Example 2 — fromPromise
```typescript
const obs = fromPromise(Promise.resolve(42));
obs.subscribe({
  next: v => console.log(v),     // 42
  complete: () => console.log('done')
});
```

### Example 3 — Operators
```typescript
const obs = new Observable<number>(observer => {
  [1, 2, 3, 4, 5].forEach(n => observer.next(n));
  observer.complete();
});

obs.filter(n => n % 2 === 0).map(n => n * 10).subscribe({
  next: v => console.log(v)  // 20, 40
});
```

## Constraints

- After `complete()` or `error()`, no more values should be emitted
- `unsubscribe()` should prevent further callbacks
- `fromPromise` must handle both resolved and rejected promises
- Operators return new Observables (lazy — not executed until subscribed)

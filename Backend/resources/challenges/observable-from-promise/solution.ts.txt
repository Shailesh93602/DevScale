/**
 * Implement Observable from Promise
 *
 * A minimal Observable with subscribe, map, filter, and fromPromise.
 * Supports lazy execution, safe emission, and cleanup.
 *
 * Time: O(1) setup, O(n) emission
 * Space: O(1) per operator
 */
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

    // Safe observer prevents emissions after complete/unsubscribe
    const safeObserver: Observer<T> = {
      next: (value: T) => {
        if (!isUnsubscribed && !isComplete) observer.next(value);
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
      (value) => { observer.next(value); observer.complete?.(); },
      (err) => { observer.error?.(err); }
    );
  });
}

export { Observable, fromPromise, Observer, Subscription };

# Implement Curry Function

## Problem Description

Implement a `curry` function that transforms a function so it can be called with its arguments one at a time (or in groups). A curried function keeps returning new functions until all expected arguments have been provided, at which point it returns the result.

## Function Signature

```typescript
function curry(fn: (...args: any[]) => any): (...args: any[]) => any
```

## Parameters

- `fn` — A function with a fixed number of parameters (determined by `fn.length`).

## Returns

A curried version of `fn` that accumulates arguments across calls and invokes `fn` once all arguments have been provided.

## Examples

### Example 1
```typescript
function add(a: number, b: number, c: number): number {
  return a + b + c;
}
const curriedAdd = curry(add);
curriedAdd(1)(2)(3);   // 6
curriedAdd(1, 2)(3);   // 6
curriedAdd(1, 2, 3);   // 6
```

### Example 2
```typescript
function multiply(a: number, b: number): number {
  return a * b;
}
const double = curry(multiply)(2);
double(5);  // 10
double(10); // 20
```

## Constraints

- `fn.length > 0`
- Arguments can be passed one at a time or in groups
- The curried function should use `fn.length` to determine when to invoke the original function

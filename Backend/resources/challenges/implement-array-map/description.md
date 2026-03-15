# Implement Array.map

## Problem Description

Implement your own version of `Array.prototype.map`. The function takes an array and a callback, and returns a new array where each element is the result of calling the callback on the corresponding element of the input array.

## Function Signature

```typescript
function myMap<T, U>(arr: T[], callback: (value: T, index: number, array: T[]) => U): U[]
```

## Parameters

- `arr` — The input array.
- `callback` — A function called for each element with `(value, index, array)`.

## Returns

A new array containing the results of calling `callback` on each element.

## Examples

### Example 1
```typescript
myMap([1, 2, 3], x => x * 2); // [2, 4, 6]
```

### Example 2
```typescript
myMap(['a', 'b', 'c'], (char, i) => `${i}:${char}`); // ['0:a', '1:b', '2:c']
```

### Example 3
```typescript
myMap([], x => x); // []
```

## Constraints

- Must not mutate the original array
- Callback receives `(element, index, array)` — all three arguments
- Must handle empty arrays
- Must handle sparse arrays (skip holes)

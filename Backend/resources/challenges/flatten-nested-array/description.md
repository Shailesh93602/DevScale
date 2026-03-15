# Flatten a Nested Array

## Problem Description

Implement a `flatten` function that takes a nested array and returns a new array with the nesting removed. An optional `depth` parameter controls how many levels of nesting to flatten. If no depth is given, flatten completely.

This is a common interview question that tests recursion and array manipulation skills.

## Function Signature

```typescript
function flatten(arr: any[], depth?: number): any[]
```

## Parameters

- `arr` — A potentially nested array.
- `depth` (optional) — The number of nesting levels to flatten. Defaults to `Infinity` (flatten completely).

## Returns

A new flattened array.

## Examples

### Example 1
```typescript
flatten([1, [2, 3], [4, [5]]]);
// [1, 2, 3, 4, 5]  (fully flattened)
```

### Example 2
```typescript
flatten([1, [2, [3, [4]]]], 1);
// [1, 2, [3, [4]]]  (one level)
```

### Example 3
```typescript
flatten([1, [2, [3, [4]]]], 2);
// [1, 2, 3, [4]]  (two levels)
```

### Example 4
```typescript
flatten([1, 2, 3]);
// [1, 2, 3]  (already flat)
```

## Constraints

- The array can contain any values including nested arrays.
- `0 <= depth <= Infinity`
- Do not mutate the original array.

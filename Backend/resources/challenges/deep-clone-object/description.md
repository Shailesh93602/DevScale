# Deep Clone an Object

## Problem Description

Implement a `deepClone` function that creates a deep copy of a given value. The cloned value must have no shared references with the original — modifying the clone should never affect the original.

Your implementation should handle:
- Primitives (numbers, strings, booleans, null, undefined)
- Plain objects
- Arrays
- Date objects
- RegExp objects
- Nested structures
- Circular references (bonus)

## Function Signature

```typescript
function deepClone<T>(obj: T): T
```

## Parameters

- `obj` — Any JavaScript value to deep clone.

## Returns

A deep copy of the input value.

## Examples

### Example 1
```typescript
const original = { a: 1, b: { c: 2, d: [3, 4] } };
const cloned = deepClone(original);
cloned.b.c = 99;
console.log(original.b.c); // 2 (unaffected)
```

### Example 2
```typescript
const arr = [1, [2, [3]]];
const clonedArr = deepClone(arr);
clonedArr[1][1][0] = 99;
console.log(arr[1][1][0]); // 3 (unaffected)
```

### Example 3
```typescript
const withDate = { created: new Date('2024-01-01') };
const cloned = deepClone(withDate);
console.log(cloned.created instanceof Date); // true
console.log(cloned.created !== withDate.created); // true (different reference)
```

## Constraints

- Must handle primitives, plain objects, arrays, Date, and RegExp
- Cloned objects must not share references with originals
- Should handle circular references without infinite loops (bonus)
- Do not use `JSON.parse(JSON.stringify())` — it loses Date, RegExp, undefined, etc.

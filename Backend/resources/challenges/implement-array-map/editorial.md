# Editorial — Implement Array.map

## Approach: Iterate and Collect

### Implementation

```typescript
function myMap<T, U>(arr: T[], callback: (value: T, index: number, array: T[]) => U): U[] {
  const result: U[] = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(callback(arr[i], i, arr));
  }
  return result;
}
```

### Complexity
- **Time**: O(n) where n = array length.
- **Space**: O(n) for the result array.

## Key Points
- The callback receives three arguments: value, index, and the original array.
- The original array is never mutated.
- Returns a new array of the same length.

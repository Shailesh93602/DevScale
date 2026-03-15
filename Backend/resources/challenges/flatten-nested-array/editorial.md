# Editorial — Flatten a Nested Array

## Approach 1: Recursive

### Intuition
Iterate through each element. If it is an array and we still have depth to flatten, recurse. Otherwise, keep the element as-is.

### Implementation

```typescript
function flatten(arr: any[], depth: number = Infinity): any[] {
  const result: any[] = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flatten(item, depth - 1));
    } else {
      result.push(item);
    }
  }
  return result;
}
```

### Complexity
- **Time**: O(n) where n is the total number of elements across all nesting levels.
- **Space**: O(n) for the result array + O(d) recursion stack where d is the nesting depth.

## Approach 2: Iterative with Stack

### Intuition
Use a stack to avoid recursion. Track each element with its remaining depth.

### Implementation

```typescript
function flatten(arr: any[], depth: number = Infinity): any[] {
  const stack: Array<{ value: any; depth: number }> = arr.map(v => ({ value: v, depth })).reverse();
  const result: any[] = [];

  while (stack.length > 0) {
    const { value, depth: d } = stack.pop()!;
    if (Array.isArray(value) && d > 0) {
      for (let i = value.length - 1; i >= 0; i--) {
        stack.push({ value: value[i], depth: d - 1 });
      }
    } else {
      result.push(value);
    }
  }

  return result;
}
```

### Complexity
- **Time**: O(n).
- **Space**: O(n) for stack and result.

## Approach 3: Using reduce

```typescript
function flatten(arr: any[], depth: number = Infinity): any[] {
  return arr.reduce((acc, item) => {
    if (Array.isArray(item) && depth > 0) {
      return acc.concat(flatten(item, depth - 1));
    }
    return acc.concat(item);
  }, []);
}
```

## Common Pitfalls
- Forgetting to handle the depth parameter (defaulting to full flatten).
- Mutating the original array.
- Not checking `Array.isArray()` properly.

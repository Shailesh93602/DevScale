# Editorial — Deep Clone an Object

## Approach 1: Recursive Clone with Type Checking

### Intuition
Check the type of each value. For primitives, return as-is. For objects, create a new object/array and recursively clone each property. Use a WeakMap to handle circular references.

### Implementation

```typescript
function deepClone<T>(obj: T, seen = new WeakMap()): T {
  // Primitives and null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Check for circular references
  if (seen.has(obj as object)) {
    return seen.get(obj as object);
  }

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  // Handle RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as unknown as T;
  }

  // Handle Array
  if (Array.isArray(obj)) {
    const arrClone: any[] = [];
    seen.set(obj as object, arrClone);
    for (const item of obj) {
      arrClone.push(deepClone(item, seen));
    }
    return arrClone as unknown as T;
  }

  // Handle plain objects
  const clone = Object.create(Object.getPrototypeOf(obj));
  seen.set(obj as object, clone);
  for (const key of Object.keys(obj)) {
    clone[key] = deepClone((obj as any)[key], seen);
  }
  return clone;
}
```

### Complexity
- **Time**: O(n) where n is total number of properties/elements.
- **Space**: O(n) for the cloned structure + O(d) recursion stack.

## Approach 2: JSON Roundtrip (Limited)

```typescript
function deepCloneSimple<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
```

**Limitations**: Loses Date (becomes string), RegExp (becomes {}), undefined (dropped), functions, circular references (throws).

## Approach 3: structuredClone (Modern)

```typescript
function deepCloneModern<T>(obj: T): T {
  return structuredClone(obj);
}
```

**Note**: Available in modern browsers and Node 17+. Handles Date, RegExp, Map, Set, ArrayBuffer, and circular references. Does not handle functions or DOM nodes.

## Common Pitfalls

- Using JSON roundtrip — loses type information.
- Not handling circular references — causes infinite recursion.
- Forgetting to clone Date and RegExp as special cases.
- Shallow copying nested objects.

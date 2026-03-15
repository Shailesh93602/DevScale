# Editorial — Build a Drag and Drop List

## Approach: History Stack with Array Operations

### Intuition
Maintain a current state array and a history stack. Each operation saves the current state to history before modifying, enabling undo.

### Implementation

```typescript
interface DragDropList<T> {
  getItems(): T[];
  moveItem(fromIndex: number, toIndex: number): void;
  swap(indexA: number, indexB: number): void;
  undo(): void;
  reset(): void;
}

function createDragDropList<T>(items: T[]): DragDropList<T> {
  const original = [...items];
  let current = [...items];
  const history: T[][] = [];

  return {
    getItems(): T[] {
      return [...current];
    },

    moveItem(fromIndex: number, toIndex: number): void {
      history.push([...current]);
      const [item] = current.splice(fromIndex, 1);
      current.splice(toIndex, 0, item);
    },

    swap(indexA: number, indexB: number): void {
      history.push([...current]);
      [current[indexA], current[indexB]] = [current[indexB], current[indexA]];
    },

    undo(): void {
      if (history.length > 0) {
        current = history.pop()!;
      }
    },

    reset(): void {
      history.push([...current]);
      current = [...original];
    }
  };
}
```

### Complexity
- **moveItem**: O(n) due to splice.
- **swap**: O(1).
- **undo**: O(1) (pop from stack).
- **Space**: O(n * h) where h is history depth, n is list size.

## Key Concepts

1. **Immutable snapshots** — Always copy before modifying to enable undo.
2. **splice for move** — Remove from source, insert at target.
3. **Destructuring swap** — `[a, b] = [b, a]` for clean swaps.
4. **History stack** — LIFO structure for undo operations.

## Common Pitfalls

- Mutating shared references instead of creating copies.
- Off-by-one errors when moving items (splice indices shift after removal).
- Not handling edge case where from === to.

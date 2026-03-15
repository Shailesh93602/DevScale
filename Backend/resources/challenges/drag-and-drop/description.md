# Build a Drag and Drop List

## Problem Description

Implement a drag-and-drop list reordering system. Build a `DragDropList` class that manages list items and supports reordering through drag-and-drop operations.

Your implementation should handle:
1. **Reordering** — Move an item from one position to another.
2. **Batch operations** — Apply multiple reorder operations.
3. **State management** — Track the current order of items.
4. **Undo** — Revert the last operation.

## Class Interface

```typescript
interface DragDropList<T> {
  getItems(): T[];
  moveItem(fromIndex: number, toIndex: number): void;
  swap(indexA: number, indexB: number): void;
  undo(): void;
  reset(): void;
}

function createDragDropList<T>(items: T[]): DragDropList<T>
```

## Methods

- `getItems()` — Returns the current ordered list.
- `moveItem(from, to)` — Removes item at `from` and inserts it at `to`.
- `swap(a, b)` — Swaps items at indices `a` and `b`.
- `undo()` — Reverts the last operation.
- `reset()` — Restores the original order.

## Examples

### Example 1 — Move
```typescript
const list = createDragDropList(['A', 'B', 'C', 'D']);
list.moveItem(0, 2);
list.getItems(); // ['B', 'C', 'A', 'D']
```

### Example 2 — Swap
```typescript
const list = createDragDropList([1, 2, 3]);
list.swap(0, 2);
list.getItems(); // [3, 2, 1]
```

### Example 3 — Undo
```typescript
const list = createDragDropList(['X', 'Y', 'Z']);
list.moveItem(0, 2);
list.getItems(); // ['Y', 'Z', 'X']
list.undo();
list.getItems(); // ['X', 'Y', 'Z']
```

## Constraints

- `1 <= items.length <= 10000`
- All indices are valid (0 <= index < length)
- Undo operates on a history stack (multiple undos supported)
- Items are not mutated — all operations return new arrangements

/**
 * Build a Drag and Drop List
 *
 * Manages list reordering with move, swap, undo, and reset.
 * Uses a history stack for undo support.
 *
 * Move: O(n), Swap: O(1), Undo: O(1)
 * Space: O(n * h) for history
 */
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

export { createDragDropList, DragDropList };

# Implement Infinite Scroll

## Problem Description

Implement an infinite scroll system that loads data in pages as the user scrolls. Build a controller that manages pagination state, loading status, and data accumulation.

## Interface

```typescript
interface InfiniteScrollConfig {
  fetchPage: (page: number, pageSize: number) => Promise<any[]>;
  pageSize: number;
}

interface InfiniteScrollController {
  loadMore(): Promise<void>;
  getItems(): any[];
  hasMore(): boolean;
  isLoading(): boolean;
  reset(): void;
}

function createInfiniteScroll(config: InfiniteScrollConfig): InfiniteScrollController
```

## Methods

- `loadMore()` — Fetches the next page and appends results. No-op if already loading or no more data.
- `getItems()` — Returns all loaded items so far.
- `hasMore()` — Returns true if more data might be available.
- `isLoading()` — Returns true if a fetch is in progress.
- `reset()` — Clears all loaded data and resets to page 1.

## Examples

### Example 1
```typescript
const scroll = createInfiniteScroll({
  fetchPage: async (page, size) => mockData.slice((page-1)*size, page*size),
  pageSize: 10
});

await scroll.loadMore(); // Loads items 1-10
console.log(scroll.getItems().length); // 10
await scroll.loadMore(); // Loads items 11-20
console.log(scroll.getItems().length); // 20
```

### Example 2 — End of Data
```typescript
// If fetchPage returns fewer items than pageSize, hasMore becomes false
await scroll.loadMore(); // Returns 5 items (pageSize is 10)
scroll.hasMore(); // false
```

### Example 3 — Concurrent Protection
```typescript
scroll.loadMore(); // Started loading
scroll.loadMore(); // No-op (already loading)
scroll.isLoading(); // true
```

## Constraints

- `pageSize >= 1`
- `fetchPage` returns a Promise resolving to an array
- If returned array length < pageSize, assume no more data
- Must prevent concurrent fetches (no parallel loadMore calls)
- Empty array return means no more data

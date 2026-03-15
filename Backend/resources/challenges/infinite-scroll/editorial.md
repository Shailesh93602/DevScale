# Editorial — Implement Infinite Scroll

## Approach: State Machine with Page Tracking

### Intuition
Track the current page, loading status, and whether more data exists. Each loadMore call increments the page, fetches data, appends results, and updates the hasMore flag based on the returned count.

### Implementation

```typescript
function createInfiniteScroll(config: InfiniteScrollConfig): InfiniteScrollController {
  const { fetchPage, pageSize } = config;
  let items: any[] = [];
  let currentPage = 0;
  let loading = false;
  let moreAvailable = true;

  return {
    async loadMore(): Promise<void> {
      if (loading || !moreAvailable) return;

      loading = true;
      try {
        currentPage++;
        const newItems = await fetchPage(currentPage, pageSize);
        items = [...items, ...newItems];

        if (newItems.length < pageSize) {
          moreAvailable = false;
        }
      } catch (error) {
        currentPage--; // Rollback on error
        throw error;
      } finally {
        loading = false;
      }
    },

    getItems(): any[] {
      return [...items];
    },

    hasMore(): boolean {
      return moreAvailable;
    },

    isLoading(): boolean {
      return loading;
    },

    reset(): void {
      items = [];
      currentPage = 0;
      loading = false;
      moreAvailable = true;
    }
  };
}
```

### Complexity
- **loadMore**: O(k) where k = pageSize (for array concatenation).
- **getItems**: O(n) where n = total loaded items.
- **hasMore/isLoading**: O(1).
- **Space**: O(n) for all loaded items.

## Key Concepts

1. **Concurrency guard** — The loading flag prevents parallel fetches.
2. **Page tracking** — Auto-incrementing page number handles sequential fetching.
3. **End detection** — `newItems.length < pageSize` signals no more data.
4. **Error recovery** — Roll back page number on fetch failure.

## Common Pitfalls

- Not preventing concurrent loadMore calls.
- Not detecting end of data (infinite loop of empty fetches).
- Mutating items array instead of creating new reference.
- Not handling fetch errors gracefully.

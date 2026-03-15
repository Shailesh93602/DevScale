/**
 * Implement Infinite Scroll
 *
 * Manages paginated data loading with concurrency protection
 * and automatic end-of-data detection.
 *
 * loadMore: O(k) where k = pageSize
 * Space: O(n) total loaded items
 */
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

function createInfiniteScroll(config: InfiniteScrollConfig): InfiniteScrollController {
  const { fetchPage, pageSize } = config;
  let items: any[] = [];
  let currentPage = 0;
  let loading = false;
  let moreAvailable = true;

  return {
    async loadMore(): Promise<void> {
      // Guard against concurrent calls and end of data
      if (loading || !moreAvailable) return;

      loading = true;
      try {
        currentPage++;
        const newItems = await fetchPage(currentPage, pageSize);
        items = [...items, ...newItems];

        // Fewer items than requested = end of data
        if (newItems.length < pageSize) {
          moreAvailable = false;
        }
      } catch (error) {
        currentPage--; // Rollback on failure
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

export { createInfiniteScroll, InfiniteScrollConfig, InfiniteScrollController };

# Editorial — Design Search Autocomplete System

### The Data Structure Choice: Optimized Trie
While a basic Trie allows $O(L)$ query time (where $L$ is prefix length), we would still need to explore all subtrees to find the top $K$ results, which is too slow.

**Optimization**: Each Trie node stores the Top $K$ suggestions for its respective prefix.
- **Query**: Becomes $O(L)$. We just walk to the prefix node and return its stored list.
- **Storage**: Increases, but manageable with sharding and pruning (removing very low-frequency entries).

### Data Flow and Refresh
1.  **Analytics Service**: Collects search logs.
2.  **Aggregation Service**: A MapReduce or Spark job that runs periodically to aggregate counts for each query.
3.  **HBase/NoSQL**: The authoritative source of the full frequency map.
4.  **Trie Builder**: Builds a fresh Trie from the aggregated data.
5.  **Trie Cache**: The sharded, in-memory Trie service that serves the actual requests.

### Reducing Latency
- **Client-Side Caching**: Cache the results of previous keystrokes on the user's browser/app.
- **Browser Fetch/Prefetch**: If a user is typing "how ", the browser might proactively fetch suggestions for common next characters.
- **Sampling/Browsing**: We don't need to process every single log to maintain accurate "top" lists; sampling can significantly reduce the load on the aggregation service.

### Handling Personalization and Trending
- **Personalization**: Merge the global Trie results with a user-specific "recent searches" list stored in Redis.
- **Trending**: Have a secondary "fast path" that pulls fresh, high-velocity topics from a stream processor (like Flink) and blends them with the static Trie results.

### Complexity Analysis
- **Query Time**: $O(L)$ where $L$ is prefix length (thanks to precomputed lists at each node).
- **Storage**: $O(N \times L \times K)$ where $N$ is unique queries and $K$ is the number of suggestions stored per node.


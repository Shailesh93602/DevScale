# Editorial: Build a GraphQL API

## Approach Overview

GraphQL differs from REST by allowing clients to request exactly the data they need in a single request. The key implementation challenges are schema design, efficient nested resolution, and preventing the N+1 query problem.

## Key Concepts

### 1. Schema-First Design
Define your types and their relationships before implementing resolvers. The schema is your API contract.

### 2. Resolver Chain
When a query requests nested data, GraphQL calls resolvers in a chain: first the parent resolver, then child resolvers for each nested field. This creates the N+1 problem.

### 3. DataLoader Pattern
DataLoader batches multiple individual lookups into a single batch query. Instead of N queries for N posts' authors, one batch query fetches all needed authors at once.

## Implementation

### Step 1: Data Layer

```typescript
// In-memory stores with relationship support
const users = new Map<string, User>();
const posts = new Map<string, Post>();
const comments = new Map<string, Comment>();
```

### Step 2: DataLoader

```typescript
class BatchLoader<K, V> {
  private batch: K[] = [];
  private batchFn: (keys: K[]) => Promise<V[]>;
  private cache: Map<K, V> = new Map();
  private scheduled = false;

  constructor(batchFn: (keys: K[]) => Promise<V[]>) {
    this.batchFn = batchFn;
  }

  async load(key: K): Promise<V> {
    if (this.cache.has(key)) return this.cache.get(key)!;
    this.batch.push(key);
    if (!this.scheduled) {
      this.scheduled = true;
      process.nextTick(() => this.executeBatch());
    }
    // Return promise that resolves when batch executes
  }
}
```

### Step 3: Resolvers

```typescript
const resolvers = {
  Query: {
    user: (_, { id }) => userLoader.load(id),
    posts: (_, { authorId, limit }) => {
      let result = Array.from(posts.values());
      if (authorId) result = result.filter(p => p.authorId === authorId);
      return result.slice(0, limit || 100);
    },
  },
  User: {
    posts: (user) => postsByAuthorLoader.load(user.id),
  },
  Post: {
    author: (post) => userLoader.load(post.authorId),
    comments: (post) => commentsByPostLoader.load(post.id),
  },
};
```

### Step 4: Query Depth Limiting

```typescript
function checkDepth(query: any, maxDepth: number, current = 0): boolean {
  if (current > maxDepth) return false;
  for (const selection of query.selectionSet?.selections || []) {
    if (!checkDepth(selection, maxDepth, current + 1)) return false;
  }
  return true;
}
```

## Complexity Analysis

- **Simple query**: O(1) per field resolution
- **Nested query with DataLoader**: O(B) where B = number of batches (typically depth of query)
- **Without DataLoader**: O(N * M) for N parents with M children each
- **DataLoader reduces**: N individual queries to 1 batch query per level

## Common Pitfalls

1. **N+1 problem**: Without DataLoader, fetching posts with authors causes 1 + N queries
2. **Circular references**: User -> Posts -> Author -> Posts creates infinite loops
3. **Missing null handling**: Fields can return null; schema must reflect this
4. **Over-fetching from DB**: Fetch only fields requested in the query
5. **No query depth limit**: Malicious deeply nested queries can DoS the server

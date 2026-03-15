# Editorial: Design a RESTful API for a Blog

## Approach Overview

This challenge tests your understanding of REST API design principles, proper HTTP semantics, input validation, and error handling. The key is to follow REST conventions consistently.

## Key Design Decisions

### 1. Resource Naming
- Use plural nouns for collections: `/posts`, `/comments`
- Use nested routes for sub-resources: `/posts/:id/comments`
- Keep URLs lowercase with hyphens if needed

### 2. HTTP Methods
- **POST** for creation (returns 201)
- **GET** for retrieval (returns 200)
- **PUT** for full updates (returns 200)
- **DELETE** for removal (returns 204)

### 3. Error Handling
Create a centralized error handler that returns consistent error responses:
```typescript
{
  error: string;
  statusCode: number;
  details?: any;
}
```

## Implementation

### Step 1: Define the Data Layer

```typescript
// In-memory store (replace with database in production)
interface Store {
  posts: Map<number, Post>;
  comments: Map<number, Comment[]>;
  nextPostId: number;
  nextCommentId: number;
}
```

### Step 2: Input Validation

```typescript
function validatePost(body: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!body.title || body.title.length > 200) errors.push('Title is required (max 200 chars)');
  if (!body.content || body.content.length > 10000) errors.push('Content is required (max 10000 chars)');
  if (!body.author) errors.push('Author is required');
  return { valid: errors.length === 0, errors };
}
```

### Step 3: Route Handlers

Each route handler follows this pattern:
1. Parse and validate input
2. Perform the operation
3. Return appropriate status code and body

### Step 4: Pagination

```typescript
function paginate<T>(items: T[], page: number, limit: number) {
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);
  return {
    data,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit)
    }
  };
}
```

## Complexity Analysis

- **Create Post**: O(1)
- **Get Post**: O(1) with Map lookup
- **List Posts**: O(n) for filtering + O(k) for pagination slice
- **Update Post**: O(1)
- **Delete Post**: O(1)
- **Add Comment**: O(1)
- **List Comments**: O(m) where m = comments for that post

## Common Pitfalls

1. **Not validating inputs** - Always validate before processing
2. **Wrong status codes** - 201 for creation, 204 for deletion, 400 for bad input
3. **Missing pagination** - Never return unbounded lists
4. **Inconsistent error format** - Use a standard error response shape
5. **Not handling missing resources** - Always check if resource exists before operations

# Design a RESTful API for a Blog

## Problem Description

Design and implement a fully RESTful API for a blog platform. The API should support creating, reading, updating, and deleting blog posts and comments, following REST best practices including proper HTTP methods, status codes, and resource naming conventions.

## Requirements

### Functional Requirements
1. **Posts CRUD**: Create, read, update, and delete blog posts
2. **Comments**: Add and list comments on posts
3. **Listing**: List all posts with pagination support
4. **Filtering**: Filter posts by author or tag
5. **Validation**: Validate all inputs before processing

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts` | Create a new post |
| GET | `/api/posts` | List all posts (with pagination) |
| GET | `/api/posts/:id` | Get a single post |
| PUT | `/api/posts/:id` | Update a post |
| DELETE | `/api/posts/:id` | Delete a post |
| POST | `/api/posts/:id/comments` | Add a comment to a post |
| GET | `/api/posts/:id/comments` | List comments for a post |

### Data Models

**Post:**
```typescript
interface Post {
  id: number;
  title: string;       // Required, 1-200 chars
  content: string;     // Required, 1-10000 chars
  author: string;      // Required
  tags: string[];      // Optional
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
}
```

**Comment:**
```typescript
interface Comment {
  id: number;
  postId: number;
  author: string;      // Required
  content: string;     // Required, 1-2000 chars
  createdAt: string;   // ISO 8601
}
```

## Examples

### Example 1: Create a Post
**Input:**
```
POST /api/posts
Content-Type: application/json

{
  "title": "Getting Started with REST",
  "content": "REST is an architectural style...",
  "author": "jane",
  "tags": ["rest", "api", "tutorial"]
}
```

**Output:**
```json
{
  "id": 1,
  "title": "Getting Started with REST",
  "content": "REST is an architectural style...",
  "author": "jane",
  "tags": ["rest", "api", "tutorial"],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```
Status: `201 Created`

### Example 2: List Posts with Pagination
**Input:**
```
GET /api/posts?page=1&limit=10&author=jane
```

**Output:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```
Status: `200 OK`

### Example 3: Post Not Found
**Input:**
```
GET /api/posts/999
```

**Output:**
```json
{
  "error": "Post not found",
  "statusCode": 404
}
```
Status: `404 Not Found`

## Constraints

- Post title: 1-200 characters
- Post content: 1-10000 characters
- Comment content: 1-2000 characters
- Page size: 1-100 (default 10)
- Must return proper HTTP status codes (200, 201, 204, 400, 404, 500)
- Must handle concurrent requests safely
- Response times should be under 200ms for single resource operations

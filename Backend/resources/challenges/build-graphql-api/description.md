# Build a GraphQL API

## Problem Description

Build a GraphQL API server for a social platform with users, posts, and comments. Implement a type schema, resolvers for queries and mutations, handle nested relationships efficiently using DataLoader, and implement proper error handling.

## Requirements

### Functional Requirements
1. **Schema Definition**: Define types for User, Post, and Comment with relationships
2. **Queries**: Fetch single/multiple users, posts, comments with nested resolution
3. **Mutations**: Create, update, delete operations for all types
4. **DataLoader**: Batch and cache database lookups to prevent N+1
5. **Input Validation**: Validate mutation inputs
6. **Error Handling**: Return structured GraphQL errors

### Schema

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  createdAt: String!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  comments: [Comment!]!
  createdAt: String!
}

type Comment {
  id: ID!
  text: String!
  author: User!
  post: Post!
  createdAt: String!
}

type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
  post(id: ID!): Post
  posts(authorId: ID, limit: Int): [Post!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  createPost(input: CreatePostInput!): Post!
  createComment(input: CreateCommentInput!): Comment!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  deletePost(id: ID!): Boolean!
}
```

## Examples

### Example 1: Nested Query
```graphql
query {
  user(id: "1") {
    name
    posts {
      title
      comments {
        text
        author { name }
      }
    }
  }
}
```
**Response:**
```json
{
  "data": {
    "user": {
      "name": "Alice",
      "posts": [{
        "title": "GraphQL Basics",
        "comments": [{
          "text": "Great article!",
          "author": { "name": "Bob" }
        }]
      }]
    }
  }
}
```

### Example 2: Mutation
```graphql
mutation {
  createPost(input: { title: "New Post", content: "Content here", authorId: "1" }) {
    id
    title
    author { name }
  }
}
```

### Example 3: Error Handling
```graphql
query { user(id: "999") { name } }
```
**Response:**
```json
{
  "data": { "user": null },
  "errors": [{ "message": "User not found", "path": ["user"] }]
}
```

## Constraints

- Maximum query depth: 5 levels
- Maximum result set: 100 items per list field
- Must use DataLoader for batched resolution of related entities
- Input strings: 1-1000 characters
- Must return partial results when some fields fail
- Query execution timeout: 5 seconds

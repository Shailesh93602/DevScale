// Build a GraphQL API - Reference Solution

import * as crypto from 'crypto';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

interface Comment {
  id: string;
  text: string;
  authorId: string;
  postId: string;
  createdAt: string;
}

interface ExecutionResult {
  data: any;
  errors?: { message: string; path?: string[] }[];
}

// DataLoader - batches and caches lookups
class DataLoader<K, V> {
  private cache: Map<string, V> = new Map();
  private batch: { key: K; resolve: (v: V) => void; reject: (e: Error) => void }[] = [];
  private batchFn: (keys: K[]) => Promise<(V | null)[]>;
  private scheduled = false;

  constructor(batchFn: (keys: K[]) => Promise<(V | null)[]>) {
    this.batchFn = batchFn;
  }

  async load(key: K): Promise<V | null> {
    const cacheKey = String(key);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    return new Promise<V>((resolve, reject) => {
      this.batch.push({ key, resolve: resolve as any, reject });

      if (!this.scheduled) {
        this.scheduled = true;
        // Execute batch on next tick
        Promise.resolve().then(() => this.executeBatch());
      }
    });
  }

  private async executeBatch(): Promise<void> {
    const currentBatch = [...this.batch];
    this.batch = [];
    this.scheduled = false;

    try {
      const keys = currentBatch.map(item => item.key);
      const values = await this.batchFn(keys);

      currentBatch.forEach((item, index) => {
        const value = values[index];
        if (value !== null && value !== undefined) {
          this.cache.set(String(item.key), value);
        }
        item.resolve(value as V);
      });
    } catch (error) {
      currentBatch.forEach(item => item.reject(error as Error));
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// In-memory data store
class DataStore {
  users: Map<string, User> = new Map();
  posts: Map<string, Post> = new Map();
  comments: Map<string, Comment> = new Map();

  // Batch loaders
  createUserLoader(): DataLoader<string, User> {
    return new DataLoader(async (ids: string[]) => {
      return ids.map(id => this.users.get(id) || null);
    });
  }

  createPostsByAuthorLoader(): DataLoader<string, Post[]> {
    return new DataLoader(async (authorIds: string[]) => {
      return authorIds.map(authorId => {
        return Array.from(this.posts.values()).filter(p => p.authorId === authorId);
      });
    });
  }

  createCommentsByPostLoader(): DataLoader<string, Comment[]> {
    return new DataLoader(async (postIds: string[]) => {
      return postIds.map(postId => {
        return Array.from(this.comments.values()).filter(c => c.postId === postId);
      });
    });
  }
}

// GraphQL Server
class GraphQLServer {
  private store: DataStore;

  constructor() {
    this.store = new DataStore();
  }

  async execute(query: string, variables?: Record<string, any>): Promise<ExecutionResult> {
    // Create fresh loaders per request (important for caching correctness)
    const userLoader = this.store.createUserLoader();
    const postsByAuthorLoader = this.store.createPostsByAuthorLoader();
    const commentsByPostLoader = this.store.createCommentsByPostLoader();

    const errors: { message: string; path?: string[] }[] = [];

    // Parse operation type (simplified parser)
    const operation = this.parseOperation(query);

    try {
      if (operation.type === 'mutation') {
        const data = await this.executeMutation(operation, variables, errors);
        return { data, ...(errors.length > 0 ? { errors } : {}) };
      }

      // Execute query
      const data = await this.executeQuery(
        operation,
        { userLoader, postsByAuthorLoader, commentsByPostLoader },
        errors
      );

      return { data, ...(errors.length > 0 ? { errors } : {}) };
    } catch (error: any) {
      errors.push({ message: error.message });
      return { data: null, errors };
    }
  }

  // Query resolvers
  private async executeQuery(
    operation: ParsedOperation,
    loaders: any,
    errors: any[]
  ): Promise<any> {
    const result: any = {};

    for (const field of operation.fields) {
      switch (field.name) {
        case 'user': {
          const id = field.args?.id;
          const user = await loaders.userLoader.load(id);
          if (!user) {
            errors.push({ message: 'User not found', path: ['user'] });
            result.user = null;
          } else {
            result.user = await this.resolveUser(user, field.selections, loaders);
          }
          break;
        }
        case 'users': {
          const limit = field.args?.limit || 100;
          const offset = field.args?.offset || 0;
          const users = Array.from(this.store.users.values()).slice(offset, offset + limit);
          result.users = await Promise.all(
            users.map(u => this.resolveUser(u, field.selections, loaders))
          );
          break;
        }
        case 'post': {
          const id = field.args?.id;
          const post = this.store.posts.get(id);
          if (!post) {
            errors.push({ message: 'Post not found', path: ['post'] });
            result.post = null;
          } else {
            result.post = await this.resolvePost(post, field.selections, loaders);
          }
          break;
        }
        case 'posts': {
          let posts = Array.from(this.store.posts.values());
          if (field.args?.authorId) {
            posts = posts.filter(p => p.authorId === field.args.authorId);
          }
          const limit = field.args?.limit || 100;
          result.posts = await Promise.all(
            posts.slice(0, limit).map(p => this.resolvePost(p, field.selections, loaders))
          );
          break;
        }
      }
    }

    return result;
  }

  // Resolve a User with requested fields
  private async resolveUser(user: User, selections: string[], loaders: any): Promise<any> {
    const resolved: any = {};
    for (const field of selections) {
      switch (field) {
        case 'id': resolved.id = user.id; break;
        case 'name': resolved.name = user.name; break;
        case 'email': resolved.email = user.email; break;
        case 'createdAt': resolved.createdAt = user.createdAt; break;
        case 'posts': {
          const posts = await loaders.postsByAuthorLoader.load(user.id) || [];
          resolved.posts = posts.map((p: Post) => ({
            id: p.id, title: p.title, content: p.content, createdAt: p.createdAt,
          }));
          break;
        }
      }
    }
    return resolved;
  }

  // Resolve a Post with requested fields
  private async resolvePost(post: Post, selections: string[], loaders: any): Promise<any> {
    const resolved: any = {};
    for (const field of selections) {
      switch (field) {
        case 'id': resolved.id = post.id; break;
        case 'title': resolved.title = post.title; break;
        case 'content': resolved.content = post.content; break;
        case 'createdAt': resolved.createdAt = post.createdAt; break;
        case 'author': {
          const author = await loaders.userLoader.load(post.authorId);
          resolved.author = author ? { id: author.id, name: author.name, email: author.email } : null;
          break;
        }
        case 'comments': {
          const comments = await loaders.commentsByPostLoader.load(post.id) || [];
          resolved.comments = comments.map((c: Comment) => ({
            id: c.id, text: c.text, createdAt: c.createdAt,
          }));
          break;
        }
      }
    }
    return resolved;
  }

  // Mutation resolvers
  private async executeMutation(
    operation: ParsedOperation,
    variables: Record<string, any> | undefined,
    errors: any[]
  ): Promise<any> {
    const result: any = {};

    for (const field of operation.fields) {
      const input = field.args?.input || variables?.input || {};

      switch (field.name) {
        case 'createUser': {
          if (!input.name || !input.email) {
            errors.push({ message: 'Name and email are required', path: ['createUser'] });
            break;
          }
          const user: User = {
            id: crypto.randomUUID(),
            name: input.name,
            email: input.email,
            createdAt: new Date().toISOString(),
          };
          this.store.users.set(user.id, user);
          result.createUser = user;
          break;
        }
        case 'createPost': {
          if (!input.title || !input.content || !input.authorId) {
            errors.push({ message: 'Title, content, and authorId are required', path: ['createPost'] });
            break;
          }
          if (!this.store.users.has(input.authorId)) {
            errors.push({ message: 'Author not found', path: ['createPost'] });
            break;
          }
          const post: Post = {
            id: crypto.randomUUID(),
            title: input.title,
            content: input.content,
            authorId: input.authorId,
            createdAt: new Date().toISOString(),
          };
          this.store.posts.set(post.id, post);
          result.createPost = { ...post, author: this.store.users.get(input.authorId) };
          break;
        }
        case 'createComment': {
          if (!input.text || !input.authorId || !input.postId) {
            errors.push({ message: 'Text, authorId, and postId are required', path: ['createComment'] });
            break;
          }
          const comment: Comment = {
            id: crypto.randomUUID(),
            text: input.text,
            authorId: input.authorId,
            postId: input.postId,
            createdAt: new Date().toISOString(),
          };
          this.store.comments.set(comment.id, comment);
          result.createComment = comment;
          break;
        }
        case 'deletePost': {
          const id = field.args?.id;
          result.deletePost = this.store.posts.delete(id);
          break;
        }
      }
    }

    return result;
  }

  // Simplified query parser (in production, use graphql-js parser)
  private parseOperation(query: string): ParsedOperation {
    const isMutation = query.trim().startsWith('mutation');
    return {
      type: isMutation ? 'mutation' : 'query',
      fields: this.parseFields(query),
    };
  }

  private parseFields(query: string): ParsedField[] {
    // Simplified field extraction - production code uses AST parsing
    return [{ name: 'root', args: {}, selections: [] }];
  }
}

interface ParsedOperation {
  type: 'query' | 'mutation';
  fields: ParsedField[];
}

interface ParsedField {
  name: string;
  args: Record<string, any>;
  selections: string[];
}

export { GraphQLServer, DataLoader, DataStore };

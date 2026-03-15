// Design a RESTful API for a Blog - Reference Solution

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: number;
  postId: number;
  author: string;
  content: string;
  createdAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

interface ErrorResponse {
  error: string;
  statusCode: number;
  details?: string[];
}

// In-memory data store
class BlogStore {
  private posts: Map<number, Post> = new Map();
  private comments: Map<number, Comment[]> = new Map();
  private nextPostId = 1;
  private nextCommentId = 1;

  // Create a new post
  createPost(data: { title: string; content: string; author: string; tags?: string[] }): Post {
    const validation = this.validatePost(data);
    if (!validation.valid) {
      throw new ValidationError('Invalid post data', validation.errors);
    }

    const now = new Date().toISOString();
    const post: Post = {
      id: this.nextPostId++,
      title: data.title,
      content: data.content,
      author: data.author,
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    this.posts.set(post.id, post);
    this.comments.set(post.id, []);
    return post;
  }

  // Get a single post by ID
  getPost(id: number): Post {
    const post = this.posts.get(id);
    if (!post) {
      throw new NotFoundError(`Post with id ${id} not found`);
    }
    return post;
  }

  // List posts with pagination and optional filters
  listPosts(options: {
    page?: number;
    limit?: number;
    author?: string;
    tag?: string;
  }): PaginatedResponse<Post> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));

    let posts = Array.from(this.posts.values());

    // Apply filters
    if (options.author) {
      posts = posts.filter(p => p.author === options.author);
    }
    if (options.tag) {
      posts = posts.filter(p => p.tags.includes(options.tag));
    }

    // Sort by creation date (newest first)
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginate
    const total = posts.length;
    const start = (page - 1) * limit;
    const data = posts.slice(start, start + limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Update a post
  updatePost(id: number, data: { title?: string; content?: string; tags?: string[] }): Post {
    const post = this.getPost(id); // throws if not found

    if (data.title !== undefined) {
      if (data.title.length === 0 || data.title.length > 200) {
        throw new ValidationError('Invalid title', ['Title must be 1-200 characters']);
      }
      post.title = data.title;
    }
    if (data.content !== undefined) {
      if (data.content.length === 0 || data.content.length > 10000) {
        throw new ValidationError('Invalid content', ['Content must be 1-10000 characters']);
      }
      post.content = data.content;
    }
    if (data.tags !== undefined) {
      post.tags = data.tags;
    }

    post.updatedAt = new Date().toISOString();
    this.posts.set(id, post);
    return post;
  }

  // Delete a post
  deletePost(id: number): void {
    if (!this.posts.has(id)) {
      throw new NotFoundError(`Post with id ${id} not found`);
    }
    this.posts.delete(id);
    this.comments.delete(id);
  }

  // Add a comment to a post
  addComment(postId: number, data: { author: string; content: string }): Comment {
    // Verify post exists
    this.getPost(postId);

    const validation = this.validateComment(data);
    if (!validation.valid) {
      throw new ValidationError('Invalid comment data', validation.errors);
    }

    const comment: Comment = {
      id: this.nextCommentId++,
      postId,
      author: data.author,
      content: data.content,
      createdAt: new Date().toISOString(),
    };

    const postComments = this.comments.get(postId) || [];
    postComments.push(comment);
    this.comments.set(postId, postComments);

    return comment;
  }

  // List comments for a post
  listComments(postId: number): Comment[] {
    this.getPost(postId); // throws if post not found
    return this.comments.get(postId) || [];
  }

  // Validation helpers
  private validatePost(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.title || typeof data.title !== 'string' || data.title.length > 200) {
      errors.push('Title is required and must be 1-200 characters');
    }
    if (!data.content || typeof data.content !== 'string' || data.content.length > 10000) {
      errors.push('Content is required and must be 1-10000 characters');
    }
    if (!data.author || typeof data.author !== 'string') {
      errors.push('Author is required');
    }
    if (data.tags && !Array.isArray(data.tags)) {
      errors.push('Tags must be an array of strings');
    }
    return { valid: errors.length === 0, errors };
  }

  private validateComment(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.author || typeof data.author !== 'string') {
      errors.push('Author is required');
    }
    if (!data.content || typeof data.content !== 'string' || data.content.length > 2000) {
      errors.push('Content is required and must be 1-2000 characters');
    }
    return { valid: errors.length === 0, errors };
  }
}

// Custom error classes
class ValidationError extends Error {
  statusCode = 400;
  details: string[];
  constructor(message: string, details: string[]) {
    super(message);
    this.details = details;
  }
}

class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
  }
}

// Express route handler example (pseudocode integration)
function setupRoutes(app: any, store: BlogStore): void {
  // POST /api/posts
  app.post('/api/posts', (req: any, res: any) => {
    try {
      const post = store.createPost(req.body);
      res.status(201).json(post);
    } catch (err: any) {
      handleError(err, res);
    }
  });

  // GET /api/posts
  app.get('/api/posts', (req: any, res: any) => {
    const result = store.listPosts({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      author: req.query.author,
      tag: req.query.tag,
    });
    res.json(result);
  });

  // GET /api/posts/:id
  app.get('/api/posts/:id', (req: any, res: any) => {
    try {
      const post = store.getPost(parseInt(req.params.id));
      res.json(post);
    } catch (err: any) {
      handleError(err, res);
    }
  });

  // PUT /api/posts/:id
  app.put('/api/posts/:id', (req: any, res: any) => {
    try {
      const post = store.updatePost(parseInt(req.params.id), req.body);
      res.json(post);
    } catch (err: any) {
      handleError(err, res);
    }
  });

  // DELETE /api/posts/:id
  app.delete('/api/posts/:id', (req: any, res: any) => {
    try {
      store.deletePost(parseInt(req.params.id));
      res.status(204).send();
    } catch (err: any) {
      handleError(err, res);
    }
  });

  // POST /api/posts/:id/comments
  app.post('/api/posts/:id/comments', (req: any, res: any) => {
    try {
      const comment = store.addComment(parseInt(req.params.id), req.body);
      res.status(201).json(comment);
    } catch (err: any) {
      handleError(err, res);
    }
  });

  // GET /api/posts/:id/comments
  app.get('/api/posts/:id/comments', (req: any, res: any) => {
    try {
      const comments = store.listComments(parseInt(req.params.id));
      res.json(comments);
    } catch (err: any) {
      handleError(err, res);
    }
  });
}

function handleError(err: any, res: any): void {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message, statusCode: 400, details: err.details });
  } else if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message, statusCode: 404 });
  } else {
    res.status(500).json({ error: 'Internal server error', statusCode: 500 });
  }
}

export { BlogStore, Post, Comment, ValidationError, NotFoundError };

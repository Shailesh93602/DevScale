/**
 * Conceptual News Feed implementation using the Fan-out on Write pattern.
 */

interface Post {
  id: string;
  authorId: string;
  content: string;
  timestamp: number;
}

class NewsFeedService {
  // Mock storage
  private posts = new Map<string, Post>();
  private followers = new Map<string, Set<string>>(); // User -> Set of followers
  private userFeedCaches = new Map<string, string[]>(); // User -> List of Post IDs

  // 1. Publishing a post (Fan-out on Write)
  public publishPost(userId: string, content: string) {
    const post: Post = {
      id: `post-${Date.now()}`,
      authorId: userId,
      content,
      timestamp: Date.now()
    };
    
    this.posts.set(post.id, post);

    // Fan-out to all followers
    const followersOfUser = this.followers.get(userId) || new Set();
    // In production, this loop would be a background task (worker)
    for (const followerId of followersOfUser) {
      this.addToFeedCache(followerId, post.id);
    }

    // Also add to own feed
    this.addToFeedCache(userId, post.id);
    
    return post;
  }

  // 2. Retrieving feed (O(1) read from cache)
  public getFeed(userId: number, limit: number = 10): Post[] {
    const postIds = this.userFeedCaches.get(userId.toString()) || [];
    // Return the actual post objects
    return postIds
      .slice(-limit) // Get latest
      .reverse()
      .map(id => this.posts.get(id)!);
  }

  public follow(followerId: string, followeeId: string) {
    if (!this.followers.has(followeeId)) {
        this.followers.set(followeeId, new Set());
    }
    this.followers.get(followeeId)!.add(followerId);
  }

  private addToFeedCache(userId: string, postId: string) {
    if (!this.userFeedCaches.has(userId)) {
        this.userFeedCaches.set(userId, []);
    }
    const cache = this.userFeedCaches.get(userId)!;
    cache.push(postId);
    // Keep cache size bounded
    if (cache.length > 500) cache.shift();
  }
}

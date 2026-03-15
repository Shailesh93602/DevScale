# Design a News Feed System

## Problem Description

Design a scalable news feed system similar to Facebook or Twitter. A news feed is a constantly updating list of stories in the middle of your home page. It includes status updates, photos, videos, links, and app activities from people, pages, and groups you follow.

## Requirements

### Functional Requirements
1. **Publish Post**: A user can publish a new post.
2. **View Feed**: A user can see a news feed containing posts from people they follow, sorted by time (reverse chronological) or relevance.
3. **Follow/Unfollow**: Users can follow and unfollow other users.

### Non-Functional Requirements
1. **Low Latency**: Generating a news feed shouldn't take more than 200ms.
2. **High Availability**: The system should be always available for reading feeds.
3. **Scalability**: Support 300M+ daily active users and handle "celebrity" users with millions of followers.
4. **Reliability**: A published post should eventually appear in all followers' feeds.

## API Design

```typescript
class NewsFeedService {
  /**
   * Returns a list of posts for the user's news feed.
   */
  getFeed(userId: string, options: FeedOptions): Post[];

  /**
   * Publishes a new post from a user.
   */
  publishPost(userId: string, content: string): Post;
}
```

## Examples

### Example 1
**User 1 follows User 2 and User 3.**
User 2 posts at 10:00 AM.
User 3 posts at 10:05 AM.
**User 1's Feed**: `[Post from User 3, Post from User 2]`

## Constraints
- A user can follow up to 5,000 people.
- A user can have millions of followers.
- Posts can include text and media IDs.

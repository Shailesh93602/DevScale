# Design a News Feed System

Design a scalable and low-latency News Feed system similar to Facebook's News Feed, Twitter's Timeline, or Instagram's Feed. A news feed is a constantly updating list of stories from people, pages, and groups that a user follows.

## Requirements

### Functional Requirements
1. **Publish Post**: Users can publish text, image, or video posts.
2. **Retrieve News Feed**: Users can see a list of posts from people they follow, ordered by time (reverse chronological) or a ranking algorithm.
3. **Friendship/Following**: Users can follow and unfollow other users.

### Non-Functional Requirements
1. **Low Latency**: Fetching the feed should be extremely fast (< 200ms).
2. **High Availability**: Reading your feed is the most frequent operation; it must always be available.
3. **Reliability**: Posts must not be lost once "published".
4. **Scalability**: Support hundreds of millions of users and handle the high "fan-out" required when a celebrity (with millions of followers) posts.

## Architecture Patterns to Consider

### 1. The Pull Model (Fan-out on Load)
News feed is generated at the time of the request.
*   **Pros**: Efficient for users who post a lot but have few followers.
*   **Cons**: Slow "get feed" operation as it requires joining multiple tables/shards.

### 2. The Push Model (Fan-out on Write)
News feed is pre-computed and stored in a "feed cache" for each user.
*   **Pros**: Blazing fast reads.
*   **Cons**: Massive "fan-out" overhead when a user with many followers posts.

### 3. The Hybrid Model
*   Use the **Push Model** for regular users.
*   Use the **Pull Model** for celebrities (fans pull celebrity posts and merge them into their pre-computed feed on-the-fly).

## Examples

**Example Scenario**:
1. User A follows B, C, and D.
2. B posts a photo. The system "fans out" this post by adding its ID to the pre-computed feed caches of all B's followers (including A).
3. A opens the app and calls `getFeed()`.
4. The system fetches the list of post IDs from A's feed cache in Redis and returns the post details.

## Constraints
- Max 5,000 friends/follows per user.
- Celebrity users can have 100M+ followers.
- Storage: Posts are stored in a distributed NoSQL database (e.g., Cassandra).
- Caching: Recent feeds are stored in a distributed memory store (e.g., Redis).


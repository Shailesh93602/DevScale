# Editorial — Design a News Feed System

### Scaling Feed Retrieval
The primary challenge of a news feed system is the massive read volume. If we tried to calculate the feed by joining the `follows` table with the `posts` table for every request, the database would buckle under the load.

### Solution: The Fan-Out Pattern
Instead of calculating the feed on-the-fly, we pre-calculate it.
1. When User B publishes a post, the system looks up all of B's followers.
2. For each follower, it inserts the post ID into their specific **Feed Cache** (usually a Redis `LIST` or `ZSET`).
3. When a follower requests their feed, the system simply returns the contents of their `LIST`. This is an $O(k)$ operation, where $k$ is the number of posts to fetch (usually 20-50).

### The "Hot User" (Celebrity) Problem
If a celebrity with 50 million followers posts, fanning out to 50 million Redis lists simultaneously is prohibitively expensive and could cause a "thundering herd" effect.

**The Hybrid Approach**:
- For regular users, continue using the **Push Model** (Fan-out on write).
- For celebrities, use the **Pull Model** (Fan-out on read). When a fan of a celebrity requests their feed, their personal feed cache results are merged with the latest posts from any celebrities they follow.

### Storage and Ranking
- **Relational vs NoSQL**: Posts themselves are usually stored in a distributed NoSQL DB like Cassandra for high write availability.
- **Ranking Algorithms**: Beyond simple reverse-chronological order, modern feeds use ML models to rank posts. To keep this fast, the ranking is often done in two stages:
    1. **Scoring**: A fast, heuristic-based scoring of candidate posts.
    2. **Re-ranking**: A more complex ML model applied only to the top 100-200 posts.

### Complexity Analysis
- **Post Publishing (Push)**: $O(\text{Followers})$.
- **Feed Retrieval**: $O(1)$ from cache.
- **Space**: $O(\text{Active Users} \times \text{Post IDs in cache})$.


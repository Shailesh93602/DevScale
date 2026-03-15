// Implement a simple MaxHeap for fetching latest tweets quickly
class Tweet {
  id: number;
  time: number;
  constructor(id: number, time: number) { this.id = id; this.time = time; }
}

export class Twitter {
  private globalTime: number;
  private users: Map<number, { followed: Set<number>; tweets: Tweet[] }>;

  constructor() {
    this.globalTime = 0;
    this.users = new Map();
  }

  private getUser(userId: number) {
    if (!this.users.has(userId)) {
      this.users.set(userId, { followed: new Set([userId]), tweets: [] });
    }
    return this.users.get(userId)!;
  }

  postTweet(userId: number, tweetId: number): void {
    const user = this.getUser(userId);
    user.tweets.push(new Tweet(tweetId, this.globalTime++));
  }

  getNewsFeed(userId: number): number[] {
    const user = this.getUser(userId);
    const followedUsers = user.followed;

    // Collect all tweets from followed users.
    // For large scale, you'd use a MaxHeap of pointers to the ends of the users' tweet arrays.
    // Given the constraints (max 30k calls), O(users * 10) sort is perfectly acceptable.
    const allRecentTweets: Tweet[] = [];

    for (const followedUser of followedUsers) {
      if (this.users.has(followedUser)) {
        const uTweets = this.users.get(followedUser)!.tweets;
        // Take at most 10 recent from this user
        for (let i = uTweets.length - 1; i >= Math.max(0, uTweets.length - 10); i--) {
          allRecentTweets.push(uTweets[i]);
        }
      }
    }

    allRecentTweets.sort((a, b) => b.time - a.time);

    return allRecentTweets.slice(0, 10).map((t) => t.id);
  }

  follow(followerId: number, followeeId: number): void {
    const user = this.getUser(followerId);
    user.followed.add(followeeId);
  }

  unfollow(followerId: number, followeeId: number): void {
    if (followerId === followeeId) return; // Cannot unfollow self
    const user = this.getUser(followerId);
    user.followed.delete(followeeId);
  }
}

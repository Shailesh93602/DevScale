# Editorial — Design Twitter

## Approach: Merge K Sorted Lists (O(U * 10 log U) Time, O(T + F) Space)

Twitter is an intricate system design challenge. 

Our required features:
1. Users need to keep track of their own tweets. A simple array `tweets` works well for each user.
2. Users need to keep track of followed users. A `Set` of `followeeId`s works best here for `O(1)` addition and deletion.
3. Tweets need globally comparable ages to sort them from newest to oldest. A global, monotonic `globalTime` counter handles this perfectly.

### Retrieving the News Feed
When retrieving the News Feed, we must merge the 10 most recent tweets from **every** followed user, including the user themselves.

Since each user's tweets array is technically sorted by `globalTime` naturally (older ones appended earlier), we are solving exactly a variation of "Merge K Sorted Lists" where we only care about the TOP 10 elements.

**A Min-Heap / Max-Heap** of size `K` or storing indices is the most scalable way to merge lists. However, since the maximum constraints are 500 users and a user can only follow at most 500 users, and we only need `10` tweets max, gathering the latest 10 tweets from all followed users and sorting them is completely negligible in practice. The maximum length of the collected local array would be `500 * 10 = 5000` items.

```typescript
export class Twitter {
  private globalTime = 0;
  private users = new Map<number, { followed: Set<number>, tweets: any[] }>();
  // See solution.ts for implementation
}
```

**Complexity:**
- **postTweet / follow / unfollow:** **O(1)**
- **getNewsFeed Time:** Gathering the top 10 tweets per followed account: `O(U * 10)`. Sorting the combined array of at most 500 accounts is `5000 log 5000`, negligible. The actual optimal "Merge K sorted lists" using MaxHeap is `O(K log U)` where `K=10`. 
- **Space:** **O(T + U + F)** where `T` is the number of tweets, `U` user entries, and `F` follows mapping.

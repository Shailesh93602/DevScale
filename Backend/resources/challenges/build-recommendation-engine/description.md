# Build a Simple Recommendation Engine

## Problem Description

Build a **collaborative filtering recommendation engine** using user-based cosine similarity. Given a user-item rating matrix, predict ratings for items a user hasn't rated and recommend the top items.

## Requirements

1. Compute cosine similarity between the target user and all other users
2. For unrated items (rating = 0), predict ratings using weighted average of similar users' ratings
3. Return top N recommended item indices sorted by predicted rating (descending)
4. Only consider users with positive similarity for predictions

## Function Signature

```typescript
function recommend(
  ratings: number[][],
  userId: number,
  numRecs: number
): { recommendations: number[] }
```

## Parameters

- `ratings`: 2D array (users x items), 0 means unrated, 1-5 are ratings
- `userId`: Target user index
- `numRecs`: Number of recommendations to return

## Example

```
Input:
  ratings = [
    [5, 3, 0, 1],
    [4, 0, 0, 1],
    [1, 1, 0, 5],
    [1, 0, 0, 4],
    [0, 1, 5, 4]
  ]
  userId = 0, numRecs = 2

Output:
  recommendations = [2, 3]

Explanation:
  User 0 has not rated items 2 and 3. Using cosine similarity
  with other users to predict those ratings, item 2 gets a higher
  predicted score than item 3 (or vice versa based on similarity).
```

## Constraints

- 1 <= users, items <= 1,000
- Ratings: 0-5 (0 = unrated)
- If fewer unrated items than numRecs, return all unrated items
- Break ties by smaller item index

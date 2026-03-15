# Editorial — Build a Simple Recommendation Engine

## Approach: User-Based Collaborative Filtering

### Intuition
Users who rated items similarly in the past will rate items similarly in the future. We use cosine similarity to find similar users and predict ratings for unrated items.

### Algorithm
1. Compute cosine similarity between target user and every other user
2. For each unrated item of the target user:
   - Compute weighted average rating from similar users
   - Weight = similarity score, Value = other user's rating
3. Sort predicted ratings descending, return top N item indices

### TypeScript Solution

```typescript
function recommend(
  ratings: number[][],
  userId: number,
  numRecs: number
): { recommendations: number[] } {
  const numUsers = ratings.length;
  const numItems = ratings[0].length;
  const userRatings = ratings[userId];

  function cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  // Compute similarities
  const similarities: number[] = [];
  for (let u = 0; u < numUsers; u++) {
    if (u === userId) {
      similarities.push(0);
    } else {
      similarities.push(cosineSimilarity(userRatings, ratings[u]));
    }
  }

  // Predict ratings for unrated items
  const predictions: { item: number; score: number }[] = [];
  for (let i = 0; i < numItems; i++) {
    if (userRatings[i] === 0) {
      let weightedSum = 0;
      let simSum = 0;
      for (let u = 0; u < numUsers; u++) {
        if (u !== userId && similarities[u] > 0 && ratings[u][i] > 0) {
          weightedSum += similarities[u] * ratings[u][i];
          simSum += similarities[u];
        }
      }
      const score = simSum > 0 ? weightedSum / simSum : 0;
      predictions.push({ item: i, score });
    }
  }

  predictions.sort((a, b) => b.score - a.score || a.item - b.item);
  return {
    recommendations: predictions.slice(0, numRecs).map(p => p.item)
  };
}
```

### Complexity
- **Time**: O(users * items) for similarity + O(items * users) for predictions
- **Space**: O(users + items)

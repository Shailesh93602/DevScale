# Editorial — Implement K-Means Clustering

## Approach: Lloyd's Algorithm

### Intuition
K-Means iteratively refines cluster assignments. Start with initial centroids, assign each point to its nearest centroid, then recompute centroids as the mean of assigned points. Repeat until stable.

### Algorithm
1. Initialize centroids (use first K points)
2. Repeat until convergence or max iterations:
   a. Assignment step: assign each point to nearest centroid
   b. Update step: recompute centroids as mean of assigned points
3. Return assignments and centroids

### TypeScript Solution

```typescript
function kMeans(
  data: number[][],
  k: number,
  maxIterations: number = 100
): { assignments: number[]; centroids: number[][] } {
  const n = data.length;
  const dims = data[0].length;

  let centroids = data.slice(0, k).map(p => [...p]);
  let assignments = new Array(n).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    const newAssignments = data.map(point => {
      let minDist = Infinity;
      let closest = 0;
      for (let c = 0; c < k; c++) {
        let dist = 0;
        for (let d = 0; d < dims; d++) {
          dist += (point[d] - centroids[c][d]) ** 2;
        }
        if (dist < minDist) {
          minDist = dist;
          closest = c;
        }
      }
      return closest;
    });

    let converged = true;
    for (let i = 0; i < n; i++) {
      if (newAssignments[i] !== assignments[i]) {
        converged = false;
        break;
      }
    }
    assignments = newAssignments;

    if (converged) break;

    centroids = Array.from({ length: k }, () => new Array(dims).fill(0));
    const counts = new Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      const c = assignments[i];
      counts[c]++;
      for (let d = 0; d < dims; d++) {
        centroids[c][d] += data[i][d];
      }
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        for (let d = 0; d < dims; d++) {
          centroids[c][d] /= counts[c];
        }
      }
    }
  }

  return {
    assignments,
    centroids: centroids.map(c => c.map(v => Math.round(v * 1000) / 1000))
  };
}
```

### Complexity
- **Time**: O(iterations * n * k * d) where n=points, k=clusters, d=dimensions
- **Space**: O(n + k * d)

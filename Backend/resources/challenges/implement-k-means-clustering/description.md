# Implement K-Means Clustering

## Problem Description

Implement the **K-Means Clustering** algorithm from scratch. K-Means partitions data into K clusters by iteratively assigning points to the nearest centroid and updating centroids.

## Requirements

1. Initialize centroids using the first K data points
2. Assign each point to the nearest centroid (Euclidean distance)
3. Update centroids as the mean of assigned points
4. Repeat until convergence or max iterations reached
5. Return cluster assignments and final centroids

## Function Signature

```typescript
function kMeans(
  data: number[][],
  k: number,
  maxIterations?: number
): { assignments: number[]; centroids: number[][] }
```

## Parameters

- `data`: 2D array of data points (n_samples x n_features)
- `k`: Number of clusters
- `maxIterations`: Maximum iterations (default: 100)

## Example

```
Input:
  data = [[1,1],[1,2],[2,1],[8,8],[8,9],[9,8]]
  k = 2

Output:
  assignments = [0,0,0,1,1,1]
  centroids = [[1.333,1.333],[8.333,8.333]]
```

## Constraints

- 1 <= k <= n_samples
- 1 <= n_samples <= 10,000
- 1 <= n_features <= 50
- Round centroids to 3 decimal places

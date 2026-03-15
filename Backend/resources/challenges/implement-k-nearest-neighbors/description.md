# Implement K-Nearest Neighbors

## Problem Description

Implement the **K-Nearest Neighbors (KNN)** classification algorithm from scratch. Given labeled training data, classify new test points by finding the K closest training points and using majority voting.

## Requirements

1. Compute Euclidean distance between points
2. For each test point, find the K nearest training points
3. Return the majority class label among the K neighbors
4. Break ties by choosing the smaller label

## Function Signature

```typescript
function knn(
  X_train: number[][],
  y_train: number[],
  X_test: number[][],
  k: number
): { predictions: number[] }
```

## Parameters

- `X_train`: 2D array of training features (n_samples x n_features)
- `y_train`: 1D array of class labels (integers)
- `X_test`: 2D array of test features
- `k`: Number of neighbors to consider

## Example

```
Input:
  X_train = [[1,1],[2,2],[3,3],[6,6],[7,7],[8,8]]
  y_train = [0,0,0,1,1,1]
  X_test = [[4,4],[7,6]]
  k = 3

Output:
  predictions = [0, 1]

Explanation:
  For [4,4]: 3 nearest are [3,3],[2,2],[1,1] -> labels [0,0,0] -> predict 0
  For [7,6]: 3 nearest are [7,7],[6,6],[8,8] -> labels [1,1,1] -> predict 1
```

## Constraints

- 1 <= k <= n_samples
- 1 <= n_samples <= 10,000
- 1 <= n_features <= 100
- Labels are non-negative integers

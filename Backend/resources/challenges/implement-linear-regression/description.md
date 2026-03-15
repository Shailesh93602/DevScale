# Implement Linear Regression from Scratch

## Problem Description

Implement a **Linear Regression** model from scratch using gradient descent optimization. Your implementation should be able to fit a linear model to training data and make predictions on new data.

Linear regression models the relationship between features X and target y as:

```
y = X * w + b
```

where `w` is the weight vector and `b` is the bias term.

## Requirements

1. **Fit**: Train the model using gradient descent to minimize Mean Squared Error (MSE)
2. **Predict**: Use learned weights and bias to predict on new data
3. **Return**: The predictions, learned weights, and bias

## Function Signature

```typescript
function linearRegression(
  X_train: number[][],
  y_train: number[],
  X_test: number[][],
  learningRate?: number,
  epochs?: number
): { predictions: number[]; weights: number[]; bias: number }
```

## Parameters

- `X_train`: 2D array of training features (n_samples x n_features)
- `y_train`: 1D array of target values
- `X_test`: 2D array of test features
- `learningRate`: Learning rate for gradient descent (default: 0.01)
- `epochs`: Number of training iterations (default: 1000)

## Example

```
Input:
  X_train = [[1], [2], [3], [4]]
  y_train = [2, 4, 6, 8]
  X_test = [[5], [6]]

Output:
  predictions = [10, 12]
  weights = [2]
  bias = 0
```

## Constraints

- 1 <= n_samples <= 10,000
- 1 <= n_features <= 100
- Learning rate > 0
- Values are finite numbers

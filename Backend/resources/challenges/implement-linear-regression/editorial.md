# Editorial — Implement Linear Regression from Scratch

## Approach 1: Gradient Descent

### Intuition
Linear regression finds the best-fit line through data by minimizing the Mean Squared Error (MSE). We use gradient descent to iteratively update weights and bias in the direction that reduces the error.

### Algorithm
1. Initialize weights to zeros and bias to 0
2. For each epoch:
   - Compute predictions: y_hat = X * w + b
   - Compute gradients of MSE with respect to w and b
   - Update w and b using the gradients and learning rate
3. Use learned parameters to predict on test data

### Gradient Computation
For MSE loss = (1/n) * sum((y - y_hat)^2):
- dw = (-2/n) * X^T * (y - y_hat)
- db = (-2/n) * sum(y - y_hat)

### TypeScript Solution

```typescript
function linearRegression(
  X_train: number[][],
  y_train: number[],
  X_test: number[][],
  learningRate: number = 0.01,
  epochs: number = 1000
): { predictions: number[]; weights: number[]; bias: number } {
  const n = X_train.length;
  const nFeatures = X_train[0].length;

  let weights = new Array(nFeatures).fill(0);
  let bias = 0;

  for (let epoch = 0; epoch < epochs; epoch++) {
    const predictions = X_train.map((x, i) => {
      let pred = bias;
      for (let j = 0; j < nFeatures; j++) {
        pred += x[j] * weights[j];
      }
      return pred;
    });

    const errors = predictions.map((pred, i) => pred - y_train[i]);

    const dw = new Array(nFeatures).fill(0);
    for (let j = 0; j < nFeatures; j++) {
      for (let i = 0; i < n; i++) {
        dw[j] += (2 / n) * errors[i] * X_train[i][j];
      }
    }
    let db = 0;
    for (let i = 0; i < n; i++) {
      db += (2 / n) * errors[i];
    }

    for (let j = 0; j < nFeatures; j++) {
      weights[j] -= learningRate * dw[j];
    }
    bias -= learningRate * db;
  }

  const testPredictions = X_test.map(x => {
    let pred = bias;
    for (let j = 0; j < nFeatures; j++) {
      pred += x[j] * weights[j];
    }
    return Math.round(pred * 1000) / 1000;
  });

  return {
    predictions: testPredictions,
    weights: weights.map(w => Math.round(w * 1000) / 1000),
    bias: Math.round(bias * 1000) / 1000
  };
}
```

## Approach 2: Normal Equation (Closed-Form)

### Intuition
The optimal weights can be computed directly: w = (X^T * X)^(-1) * X^T * y

This avoids iteration but requires matrix inversion, which is O(n^3) and can be numerically unstable.

### Complexity
- **Gradient Descent**: Time O(epochs * n * d), Space O(d)
- **Normal Equation**: Time O(n * d^2 + d^3), Space O(d^2)

Where n = samples, d = features.

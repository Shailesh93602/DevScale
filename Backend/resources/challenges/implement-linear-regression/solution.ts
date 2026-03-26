function linearRegression(
  X_train: number[][],
  y_train: number[],
  X_test: number[][],
  learningRate: number = 0.01,
  epochs: number = 1000
): { predictions: number[]; weights: number[]; bias: number } {
  const n = X_train.length;
  const nFeatures = X_train[0].length;

  // Initialize parameters
  const weights = new Array(nFeatures).fill(0);
  let bias = 0;

  // Gradient descent
  for (let epoch = 0; epoch < epochs; epoch++) {
    // Forward pass
    const predictions = X_train.map((x) => {
      let pred = bias;
      for (let j = 0; j < nFeatures; j++) {
        pred += x[j] * weights[j];
      }
      return pred;
    });

    // Compute errors
    const errors = predictions.map((pred, i) => pred - y_train[i]);

    // Compute gradients
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

    // Update parameters
    for (let j = 0; j < nFeatures; j++) {
      weights[j] -= learningRate * dw[j];
    }
    bias -= learningRate * db;
  }

  // Predict on test data
  const testPredictions = X_test.map((x) => {
    let pred = bias;
    for (let j = 0; j < nFeatures; j++) {
      pred += x[j] * weights[j];
    }
    return Math.round(pred * 1000) / 1000;
  });

  return {
    predictions: testPredictions,
    weights: weights.map((w) => Math.round(w * 1000) / 1000),
    bias: Math.round(bias * 1000) / 1000,
  };
}

export { linearRegression };

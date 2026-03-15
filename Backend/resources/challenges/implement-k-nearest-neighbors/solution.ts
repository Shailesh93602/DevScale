function knn(
  X_train: number[][],
  y_train: number[],
  X_test: number[][],
  k: number
): { predictions: number[] } {
  function euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
  }

  const predictions = X_test.map((testPoint) => {
    const distances = X_train.map((trainPoint, idx) => ({
      distance: euclideanDistance(testPoint, trainPoint),
      label: y_train[idx],
    }));

    distances.sort((a, b) => a.distance - b.distance);
    const kNearest = distances.slice(0, k);

    const voteCounts = new Map<number, number>();
    for (const neighbor of kNearest) {
      voteCounts.set(
        neighbor.label,
        (voteCounts.get(neighbor.label) || 0) + 1
      );
    }

    let maxVotes = 0;
    let prediction = Infinity;
    for (const [label, count] of voteCounts) {
      if (count > maxVotes || (count === maxVotes && label < prediction)) {
        maxVotes = count;
        prediction = label;
      }
    }

    return prediction;
  });

  return { predictions };
}

export { knn };

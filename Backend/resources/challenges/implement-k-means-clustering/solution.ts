function kMeans(
  data: number[][],
  k: number,
  maxIterations: number = 100
): { assignments: number[]; centroids: number[][] } {
  const n = data.length;
  const dims = data[0].length;

  // Initialize centroids with first K points
  let centroids = data.slice(0, k).map((p) => [...p]);
  let assignments = new Array(n).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assignment step
    const newAssignments = data.map((point) => {
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

    // Check convergence
    let converged = true;
    for (let i = 0; i < n; i++) {
      if (newAssignments[i] !== assignments[i]) {
        converged = false;
        break;
      }
    }
    assignments = newAssignments;
    if (converged) break;

    // Update step
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
    centroids: centroids.map((c) => c.map((v) => Math.round(v * 1000) / 1000)),
  };
}

export { kMeans };

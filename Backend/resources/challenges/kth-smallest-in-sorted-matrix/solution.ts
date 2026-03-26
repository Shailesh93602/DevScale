function kthSmallest(matrix: number[][], k: number): number {
  const n = matrix.length;
  let low = matrix[0][0];
  let high = matrix[n - 1][n - 1];

  while (low < high) {
    let mid = Math.floor((low + high) / 2);
    if (countLessEqual(matrix, mid) < k) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

function countLessEqual(matrix: number[][], target: number): number {
  const n = matrix.length;
  let count = 0;
  let r = n - 1;
  let c = 0;

  while (r >= 0 && c < n) {
    if (matrix[r][c] <= target) {
      count += r + 1;
      c++;
    } else {
      r--;
    }
  }

  return count;
}

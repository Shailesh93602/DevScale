// O(log(m*n)) — Binary search treating matrix as flat sorted array
function searchMatrix(matrix: number[][], target: number): boolean {
  const m = matrix.length, n = matrix[0].length;
  let left = 0, right = m * n - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const val = matrix[Math.floor(mid / n)][mid % n];

    if (val === target) return true;
    else if (val < target) left = mid + 1;
    else right = mid - 1;
  }

  return false;
}

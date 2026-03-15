# Editorial — Search a 2D Matrix

## Key Insight

Because each row is sorted AND each row's first element is greater than the last element of the previous row, the entire matrix is effectively **one contiguous sorted array** of size `m * n`. We can binary search it directly.

## Approach — Binary Search Treating Matrix as 1D Array

Map `mid` index back to 2D coords: `row = Math.floor(mid / n)`, `col = mid % n`.

```typescript
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
```

**Complexity:**
- Time: **O(log(m × n))** — Standard binary search on virtual 1D array.
- Space: **O(1)**

# Editorial — Spiral Matrix

## Problem Summary

Traverse an m×n matrix in clockwise spiral order, starting from the top-left, and return all elements in that order.

---

## Approach — Layer-by-Layer Boundary Shrinking (O(m*n) Time, O(1) Space)

Maintain four boundaries: `top`, `bottom`, `left`, `right`. Traverse each side of the current outermost layer, then shrink the boundaries inward.

```typescript
function spiralOrder(matrix: number[][]): number[] {
  const result: number[] = [];
  let top = 0, bottom = matrix.length - 1;
  let left = 0, right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    // → Traverse right along top row
    for (let col = left; col <= right; col++) result.push(matrix[top][col]);
    top++;

    // ↓ Traverse down right column
    for (let row = top; row <= bottom; row++) result.push(matrix[row][right]);
    right--;

    // ← Traverse left along bottom row (if still valid)
    if (top <= bottom) {
      for (let col = right; col >= left; col--) result.push(matrix[bottom][col]);
      bottom--;
    }

    // ↑ Traverse up left column (if still valid)
    if (left <= right) {
      for (let row = bottom; row >= top; row--) result.push(matrix[row][left]);
      left++;
    }
  }

  return result;
}
```

**Why check `top <= bottom` and `left <= right` before the bottom/left traversals?**

After traversing the top row and right column, `top` and `right` have been updated. If the matrix had only one row or one column total, `top > bottom` or `left > right` at that point. Without these guards, elements would be added twice!

**Complexity:**
- Time: **O(m × n)** — Every element is visited exactly once.
- Space: **O(1)** — Excluding the output array, only four integers are used.

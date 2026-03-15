# Editorial — Rotate Image

## Key Insight: Transpose + Reverse

To rotate 90° clockwise **in-place**:
1. **Transpose** the matrix: `matrix[i][j] ↔ matrix[j][i]`
2. **Reverse each row**

**Why does this work?**

After transposition, element at `(i, j)` moves to `(j, i)`. After reversing each row, element at `(j, i)` moves to `(j, n-1-i)`. Compare to the direct rotation formula `(i, j) → (j, n-1-i)` — it matches exactly!

```typescript
function rotate(matrix: number[][]): void {
  const n = matrix.length;

  // Step 1: Transpose (swap across diagonal)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }

  // Step 2: Reverse each row
  for (let i = 0; i < n; i++) {
    matrix[i].reverse();
  }
}
```

**Complexity:**
- Time: **O(n²)** — We visit every element twice.
- Space: **O(1)** — In-place, no extra matrix.

---

## Alternative: 4-Way Cycle Rotation

Rotate 4 elements at a time in their correct cycle:

```typescript
function rotate(matrix: number[][]): void {
  const n = matrix.length;
  for (let i = 0; i < Math.floor(n / 2); i++) {
    for (let j = i; j < n - 1 - i; j++) {
      const temp = matrix[i][j];
      matrix[i][j] = matrix[n-1-j][i];
      matrix[n-1-j][i] = matrix[n-1-i][n-1-j];
      matrix[n-1-i][n-1-j] = matrix[j][n-1-i];
      matrix[j][n-1-i] = temp;
    }
  }
}
```

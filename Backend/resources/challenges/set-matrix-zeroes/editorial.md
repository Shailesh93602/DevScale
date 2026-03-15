# Editorial — Set Matrix Zeroes

## Approach 1 — HashSet Tracking (O(m+n) Space)

Collect all zero rows and columns in two Sets, then zero out.

```typescript
function setZeroes(matrix: number[][]): void {
  const zeroRows = new Set<number>();
  const zeroCols = new Set<number>();
  for (let r = 0; r < matrix.length; r++)
    for (let c = 0; c < matrix[0].length; c++)
      if (matrix[r][c] === 0) { zeroRows.add(r); zeroCols.add(c); }
  for (let r = 0; r < matrix.length; r++)
    for (let c = 0; c < matrix[0].length; c++)
      if (zeroRows.has(r) || zeroCols.has(c)) matrix[r][c] = 0;
}
```

**Complexity:** Time **O(m×n)**, Space **O(m+n)**

---

## Approach 2 — Use First Row/Column as Markers (O(1) Space)

Instead of a separate Set, use `matrix[0][c]` and `matrix[r][0]` as marker flags.

1. Check if row 0 or col 0 contains a zero (save as booleans).
2. For every other cell `(r,c)` where `matrix[r][c] === 0`, mark `matrix[r][0] = 0` and `matrix[0][c] = 0`.
3. Iterate `r` from 1, `c` from 1 — if `matrix[r][0]` or `matrix[0][c]` is 0, set `matrix[r][c] = 0`.
4. Apply the saved booleans to zero out row 0 and col 0 if needed.

```typescript
function setZeroes(matrix: number[][]): void {
  const m = matrix.length, n = matrix[0].length;
  let firstRowZero = matrix[0].includes(0);
  let firstColZero = matrix.some(row => row[0] === 0);

  for (let r = 1; r < m; r++)
    for (let c = 1; c < n; c++)
      if (matrix[r][c] === 0) { matrix[r][0] = 0; matrix[0][c] = 0; }

  for (let r = 1; r < m; r++)
    for (let c = 1; c < n; c++)
      if (matrix[r][0] === 0 || matrix[0][c] === 0) matrix[r][c] = 0;

  if (firstRowZero) for (let c = 0; c < n; c++) matrix[0][c] = 0;
  if (firstColZero) for (let r = 0; r < m; r++) matrix[r][0] = 0;
}
```

**Complexity:** Time **O(m×n)**, Space **O(1)**

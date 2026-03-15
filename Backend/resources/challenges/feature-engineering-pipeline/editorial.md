# Editorial — Build a Feature Engineering Pipeline

## Approach: Sequential Transformation Pipeline

### Intuition
Process each operation in order, building up the result feature matrix. Each operation either transforms an existing column or replaces it with multiple columns (one-hot encoding).

### Algorithm
1. Parse each operation to determine type and target column
2. Apply transformations sequentially:
   - Normalize: compute min/max, scale to [0,1]
   - Standardize: compute mean/std, apply z-score
   - One-hot: find unique values, create binary columns
   - Bin: compute bin edges, assign bin indices
   - Log transform: apply log(1+x)
3. Build final feature matrix and column names

### TypeScript Solution

```typescript
function featureEngineeringPipeline(
  data: any[][],
  columns: string[],
  operations: string[]
): { features: number[][]; column_names: string[] } {
  const n = data.length;
  let resultColumns: { name: string; values: number[] }[] = [];

  // Initialize with original data columns
  const colMap = new Map<string, any[]>();
  for (let j = 0; j < columns.length; j++) {
    colMap.set(columns[j], data.map(row => row[j]));
  }

  for (const op of operations) {
    const parts = op.split(":");
    const type = parts[0];
    const col = parts[1];
    const values = colMap.get(col)!;

    if (type === "normalize") {
      const nums = values.map(Number);
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const range = max - min;
      const normalized = nums.map(v => range === 0 ? 0 : Math.round(((v - min) / range) * 1000) / 1000);
      resultColumns.push({ name: `${col}_norm`, values: normalized });
    } else if (type === "standardize") {
      const nums = values.map(Number);
      const mean = nums.reduce((a, b) => a + b, 0) / n;
      const std = Math.sqrt(nums.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
      const standardized = nums.map(v => std === 0 ? 0 : Math.round(((v - mean) / std) * 1000) / 1000);
      resultColumns.push({ name: `${col}_std`, values: standardized });
    } else if (type === "one_hot") {
      const unique = [...new Set(values.map(String))].sort();
      for (const cat of unique) {
        resultColumns.push({
          name: `${col}_${cat}`,
          values: values.map(v => String(v) === cat ? 1 : 0)
        });
      }
    } else if (type === "bin") {
      const numBins = parseInt(parts[2]);
      const nums = values.map(Number);
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const binWidth = (max - min) / numBins;
      const binned = nums.map(v => {
        if (binWidth === 0) return 0;
        const bin = Math.floor((v - min) / binWidth);
        return Math.min(bin, numBins - 1);
      });
      resultColumns.push({ name: `${col}_bin`, values: binned });
    } else if (type === "log_transform") {
      const nums = values.map(Number);
      const logged = nums.map(v => Math.round(Math.log(1 + v) * 1000) / 1000);
      resultColumns.push({ name: `${col}_log`, values: logged });
    }
  }

  const features = Array.from({ length: n }, (_, i) =>
    resultColumns.map(col => col.values[i])
  );

  return {
    features,
    column_names: resultColumns.map(c => c.name)
  };
}
```

### Complexity
- **Time**: O(n * ops * d) where n=rows, ops=operations, d=features
- **Space**: O(n * d_output) for the output matrix

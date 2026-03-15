# Build a Feature Engineering Pipeline

## Problem Description

Build a **Feature Engineering Pipeline** that applies a sequence of transformations to raw data and outputs a numerical feature matrix. The pipeline should support multiple transformation types and handle both numerical and categorical data.

## Supported Operations

1. **normalize:column** - Min-max normalization to [0,1] range: (x - min) / (max - min)
2. **standardize:column** - Z-score standardization: (x - mean) / std
3. **one_hot:column** - One-hot encoding for categorical columns
4. **bin:column:n** - Equal-width binning into n bins (returns bin index)
5. **log_transform:column** - Apply log(1 + x) transformation

## Function Signature

```typescript
function featureEngineeringPipeline(
  data: any[][],
  columns: string[],
  operations: string[]
): { features: number[][]; column_names: string[] }
```

## Parameters

- `data`: 2D array of raw data (rows x columns), can contain numbers and strings
- `columns`: Column names corresponding to each column in data
- `operations`: List of transformations to apply in order

## Example

```
Input:
  data = [[1,100,"cat"],[2,200,"dog"],[3,300,"cat"]]
  columns = ["age","salary","pet"]
  operations = ["normalize:age","normalize:salary","one_hot:pet"]

Output:
  features = [[0,0,1,0],[0.5,0.5,0,1],[1,1,1,0]]
  column_names = ["age_norm","salary_norm","pet_cat","pet_dog"]
```

## Constraints

- 1 <= rows <= 10,000
- 1 <= columns <= 50
- Round numerical values to 3 decimal places
- For one-hot encoding, sort categories alphabetically
- If max equals min in normalization, output 0

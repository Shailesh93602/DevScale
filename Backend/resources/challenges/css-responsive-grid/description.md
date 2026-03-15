# CSS: Responsive Grid System

## Problem Description

Build a function that generates a responsive CSS grid system. Given a configuration with column count, gap size, and breakpoints, generate the CSS rules that create a responsive grid layout — similar to Bootstrap's grid but using CSS Grid.

## Function Signature

```typescript
interface GridConfig {
  columns: number;
  gap: string;
  breakpoints: Record<string, number>;
}

function createGrid(config: GridConfig): string
```

## Parameters

- `config.columns` — Total number of columns (e.g., 12).
- `config.gap` — Gap between grid items (e.g., '16px').
- `config.breakpoints` — Named breakpoints with min-width values (e.g., `{ sm: 640, md: 768, lg: 1024 }`).

## Returns

A CSS string that defines:
1. A `.grid` container class with CSS Grid layout
2. `.col-{n}` classes for spanning n columns (1 to max)
3. Responsive `.col-{breakpoint}-{n}` classes within media queries

## Examples

### Example 1
```typescript
const css = createGrid({
  columns: 12,
  gap: '16px',
  breakpoints: { sm: 640, md: 768 }
});
```

Generated CSS should include:
```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.col-1 { grid-column: span 1; }
.col-2 { grid-column: span 2; }
/* ... up to .col-12 */
@media (min-width: 640px) {
  .col-sm-1 { grid-column: span 1; }
  /* ... */
}
@media (min-width: 768px) {
  .col-md-1 { grid-column: span 1; }
  /* ... */
}
```

## Constraints

- `1 <= columns <= 24`
- Breakpoints are valid positive integers (pixel values)
- Gap is a valid CSS length value
- Generated CSS must be syntactically valid

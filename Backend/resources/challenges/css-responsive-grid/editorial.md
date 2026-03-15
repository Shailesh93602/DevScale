# Editorial — CSS: Responsive Grid System

## Approach: String-Based CSS Generation

### Intuition
Generate CSS strings by iterating over the configuration. First create the base grid container, then base column classes, then media-query-wrapped responsive classes for each breakpoint.

### Implementation

```typescript
interface GridConfig {
  columns: number;
  gap: string;
  breakpoints: Record<string, number>;
}

function createGrid(config: GridConfig): string {
  const { columns, gap, breakpoints } = config;
  let css = '';

  // Grid container
  css += `.grid {\n  display: grid;\n  grid-template-columns: repeat(${columns}, 1fr);\n  gap: ${gap};\n}\n\n`;

  // Base column classes
  for (let i = 1; i <= columns; i++) {
    css += `.col-${i} { grid-column: span ${i}; }\n`;
  }
  css += '\n';

  // Responsive column classes
  const sortedBreakpoints = Object.entries(breakpoints).sort((a, b) => a[1] - b[1]);

  for (const [name, minWidth] of sortedBreakpoints) {
    css += `@media (min-width: ${minWidth}px) {\n`;
    for (let i = 1; i <= columns; i++) {
      css += `  .col-${name}-${i} { grid-column: span ${i}; }\n`;
    }
    css += `}\n\n`;
  }

  return css.trim();
}
```

### Complexity
- **Time**: O(b * c) where b = breakpoints, c = columns.
- **Space**: O(b * c) for the generated string.

## Key Concepts

1. **CSS Grid** — `grid-template-columns: repeat(n, 1fr)` creates equal columns.
2. **Mobile-first** — Breakpoints sorted ascending so smaller screens are default.
3. **Grid-column span** — `grid-column: span n` makes an item span n columns.

## Common Pitfalls

- Not sorting breakpoints — media queries should go from smallest to largest.
- Forgetting the base (non-responsive) column classes.
- Invalid CSS syntax in generated output.

/**
 * CSS: Responsive Grid System
 *
 * Generates a complete responsive CSS grid system
 * from a configuration object.
 *
 * Time: O(b * c) where b = breakpoints, c = columns
 * Space: O(b * c) for generated CSS string
 */
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

  // Base column span classes
  for (let i = 1; i <= columns; i++) {
    css += `.col-${i} { grid-column: span ${i}; }\n`;
  }
  css += '\n';

  // Responsive classes within media queries (mobile-first order)
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

export { createGrid, GridConfig };

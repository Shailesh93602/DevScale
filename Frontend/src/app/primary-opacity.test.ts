// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import config from '../../tailwind.config';

// Tailwind 3 silently emits nothing for `bg-primary/10` when `primary` is a bare hex var.
describe('primary colour opacity modifiers', () => {
  it('compiles bg-primary/10, border-primary/20 and hover:bg-primary/90', async () => {
    const { css } = await postcss([
      tailwindcss({
        ...config,
        content: [
          { raw: 'bg-primary/10 border-primary/20 hover:bg-primary/90' },
        ],
      }),
    ]).process('@tailwind utilities;', { from: undefined });
    expect(css).toContain('.bg-primary\\/10');
    expect(css).toContain('.border-primary\\/20');
    expect(css).toContain('.hover\\:bg-primary\\/90:hover');
  });

  it('--primary is HSL channels in both themes, so hsl(var(--primary) / a) is valid CSS', () => {
    const css = readFileSync(
      join(process.cwd(), 'src/app/globals.css'),
      'utf8',
    );
    const values = [...css.matchAll(/--primary:\s*([^;]+);/g)].map((m) => m[1]);
    expect(values.length).toBeGreaterThanOrEqual(2);
    for (const v of values)
      expect(v).toMatch(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/);
  });
});

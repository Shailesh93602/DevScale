import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITEMAP_PATHS } from './sitemap';

const llms = readFileSync(join(process.cwd(), 'public', 'llms.txt'), 'utf8');
const linkedPaths = [
  ...llms.matchAll(/https:\/\/eduscale\.vercel\.app(\/[^\s)]*)/g),
].map((m) => m[1]);

describe('public/llms.txt', () => {
  it('links only pages an anonymous visitor can load', () => {
    expect(linkedPaths.length).toBeGreaterThan(0);
    for (const p of linkedPaths) expect(SITEMAP_PATHS, p).toContain(p);
  });

  it('lists every sitemap page', () => {
    for (const p of SITEMAP_PATHS) expect(linkedPaths, p).toContain(p);
  });

  it('links the author portfolio', () => {
    expect(llms).toContain('https://shaileshchaudhari.vercel.app');
  });
});

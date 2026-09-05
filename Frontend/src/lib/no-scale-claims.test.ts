import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The public DevScale mirror is what a recruiter opens. Its root CLAUDE.md
 * opened with a ten-million-user target for a platform that has never
 * measured anything like it — an aspiration that reads as a claim. This test
 * keeps unbacked scale figures out of every prose file the mirror serves.
 *
 * If a number like this ever becomes true, the honest move is to add the
 * measurement that proves it and relax the pattern here — not to delete the
 * test.
 */

const repoRoot = join(__dirname, '..', '..', '..');

const PROSE_FILES = [
  'CLAUDE.md',
  'README.md',
  'FINDINGS.md',
  'Frontend/public/llms.txt',
  ...readdirSync(join(repoRoot, 'docs'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => `docs/${f}`),
];

const UNBACKED_SCALE_CLAIMS: Array<{ label: string; pattern: RegExp }> = [
  { label: '10M', pattern: /\b10\s?M\+?\b/ },
  { label: '10 million', pattern: /\b10\+?\s?million/i },
  { label: 'millions of users', pattern: /millions? of users/i },
  { label: 'thousands of users', pattern: /thousands of users/i },
  { label: 'enterprise-grade', pattern: /enterprise[- ]grade/i },
];

describe('no unbacked scale claims in the public prose', () => {
  it('scans the files a visitor actually reads', () => {
    expect(PROSE_FILES.length).toBeGreaterThan(4);
  });

  for (const rel of PROSE_FILES) {
    it(`${rel} names no user-count it cannot back`, () => {
      const text = readFileSync(join(repoRoot, rel), 'utf8');
      const hits = UNBACKED_SCALE_CLAIMS.filter((c) =>
        c.pattern.test(text),
      ).map((c) => c.label);
      expect(hits, `${rel} contains: ${hits.join(', ')}`).toEqual([]);
    });
  }
});

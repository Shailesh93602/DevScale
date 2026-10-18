// Vercel type-checks every uploaded .ts; the standalone reference solutions failed every build, so they ship as .ts.txt.
import { describe, it, expect } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';

const challengesDir = path.resolve(process.cwd(), 'resources', 'challenges');

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

describe('challenge resources', () => {
  const files = walk(challengesDir);

  it('contains no .ts file for the deploy type-checker to pick up', () => {
    const tsFiles = files
      .filter((f) => f.endsWith('.ts'))
      .map((f) => path.relative(challengesDir, f));
    expect(tsFiles).toEqual([]);
  });

  it('still ships the reference solutions under the name the seeders read', () => {
    expect(
      files.filter((f) => f.endsWith(`${path.sep}solution.ts.txt`)).length
    ).toBeGreaterThan(0);
    for (const seeder of [
      'singleChallenge.seeder.ts',
      'masterChallenge.seeder.ts',
    ]) {
      const source = fs.readFileSync(
        path.resolve(process.cwd(), 'prisma', 'seeders', seeder),
        'utf-8'
      );
      expect(source).toContain("'solution.ts.txt'");
      expect(source).not.toContain("'solution.ts'");
    }
  });
});

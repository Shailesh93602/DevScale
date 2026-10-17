// eduscale-backend#22-20 / #22-12 — no unmounted handler that runs code on the host
// or approves/creates articles unsanitised is left for someone to wire up later.
import { describe, it, expect } from '@jest/globals';
import * as fs from 'node:fs';
import * as path from 'node:path';

const SRC = path.join(__dirname, '../..');
const sources = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'tests' ? [] : sources(full);
    return e.name.endsWith('.ts') ? [full] : [];
  });

describe('host code execution', () => {
  it('no application source spawns processes on the API host', () => {
    const offenders = sources(SRC).filter((f) =>
      /from ['"](node:)?child_process['"]|require\(['"](node:)?child_process/.test(
        fs.readFileSync(f, 'utf8')
      )
    );
    expect(offenders.map((f) => path.relative(SRC, f))).toEqual([]);
  });

  it('ResourceController carries no unrouted article/topic mutators', () => {
    const src = fs.readFileSync(
      path.join(SRC, 'controllers/resourceController.ts'),
      'utf8'
    );
    for (const name of ['selectArticle', 'createArticle', 'addTopic']) {
      expect(src).not.toMatch(new RegExp(`public ${name}\\b`));
    }
  });
});

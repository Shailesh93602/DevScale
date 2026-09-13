/**
 * Every package `src/` imports must be DECLARED in package.json.
 *
 * WHY THIS EXISTS. On 2026-09-13 removing Storybook — five unused packages, zero
 * story files — broke `tsc` on `@testing-library/user-event`. A test imported it
 * directly, but it had never been a declared dependency; it arrived transitively
 * under `@storybook/test-runner`. Deleting something unused broke something used.
 *
 * The audit that followed found three more of the same shape, all shipping code:
 *
 *   clsx                 imported by src/utils/cn.ts        arrived under class-variance-authority
 *   lodash               imported by RoadmapDashboard.tsx   arrived under recharts
 *   tsparticles-engine   imported by ParticlesBackground    arrived under react-tsparticles
 *
 * `@types/lodash` was declared while `lodash` itself was not, which is the whole
 * bug in one line: the types were owned, the runtime was borrowed.
 *
 * What a package tree HAPPENS to hoist is not what your code is ALLOWED to rely
 * on. A dependency you did not declare can vanish when an unrelated package is
 * upgraded or removed, and the failure lands nowhere near the cause. The same
 * lesson as the htmlparser2 hoist in #49.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'src');
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

/** Node builtins are never declared and never should be. */
const BUILTIN = new Set(
  (
    'assert buffer child_process cluster console crypto dns events fs http http2 https module net os ' +
    'path perf_hooks process punycode querystring readline stream string_decoder timers tls tty url ' +
    'util v8 vm worker_threads zlib'
  ).split(' '),
);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (EXT.has(full.slice(full.lastIndexOf('.')))) out.push(full);
  }
  return out;
}

/** "@scope/name/deep" -> "@scope/name"; "name/deep" -> "name". */
function packageOf(spec: string): string | null {
  const mod = spec.replace(/^node:/, '');
  // Relative, absolute and path-aliased imports are not packages.
  if (
    mod.startsWith('.') ||
    mod.startsWith('/') ||
    mod.startsWith('@/') ||
    mod.startsWith('~')
  ) {
    return null;
  }
  const parts = mod.split('/');
  const name = mod.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
  return BUILTIN.has(name) ? null : name;
}

const IMPORT_RE =
  /(?:^|\n)\s*(?:import|export)\s[^;]*?from\s+["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)|import\(\s*["']([^"']+)["']\s*\)/g;

/**
 * Strip comments before scanning. Without this the very first run reported
 * `react-quill` as an undeclared dependency of `EditArticle.tsx` — where both
 * mentions are commented out and the package is not installed at all. A guard
 * that cries wolf is a guard that gets muted, so it has to read only live code.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/(^|[^:"'`\\])\/\/.*$/gm, '$1');
}

describe('declared dependencies', () => {
  it('every package imported by src/ is declared in package.json', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    const declared = new Set([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
      ...Object.keys(pkg.optionalDependencies ?? {}),
    ]);

    const undeclared = new Map<string, string>();
    for (const file of walk(SRC)) {
      const src = stripComments(readFileSync(file, 'utf8'));
      for (const m of src.matchAll(IMPORT_RE)) {
        const name = packageOf(m[1] ?? m[2] ?? m[3] ?? '');
        if (name && !declared.has(name) && !undeclared.has(name)) {
          undeclared.set(name, relative(ROOT, file));
        }
      }
    }

    // Reported as an object so a failure names the package AND where it is used,
    // rather than just saying a set was non-empty.
    expect(Object.fromEntries(undeclared)).toEqual({});
  });

  it('a package with declared @types has the runtime package declared too', () => {
    // `@types/lodash` was declared while `lodash` was not — types owned, runtime
    // borrowed. That asymmetry is always a mistake and is cheap to catch.
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    const all = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    const orphans = Object.keys(all)
      .filter((k) => k.startsWith('@types/'))
      .map((k) => k.slice('@types/'.length))
      .filter((base) => !['node', 'react', 'react-dom'].includes(base))
      .filter((base) => !(base in all));
    expect(orphans).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

// `user` from useAuth() can be the session fallback, whose id is not a User.id.
// Id comparisons must use `userId`, which is null until the profile loads.
const SRC = path.join(__dirname, '..');

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sources(full);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)
      ? [full]
      : [];
  });
}

/** Local names `user` is bound to by `const { ... } = useAuth()`. */
function authUserBindings(code: string): string[] {
  const names: string[] = [];
  for (const m of code.matchAll(/const\s*\{([^}]*)\}\s*=\s*useAuth\(\)/g)) {
    const u = m[1].match(/(?:^|,)\s*user\s*(?::\s*(\w+))?\s*(?:,|$)/);
    if (u) names.push(u[1] ?? 'user');
  }
  return names;
}

function idReads(code: string): string[] {
  return authUserBindings(code).flatMap((name) =>
    [...code.matchAll(new RegExp(`\\b${name}\\??\\.id\\b`, 'g'))].map(
      (m) => m[0],
    ),
  );
}

describe('useAuth().user.id is never read', () => {
  it('finds the reads it is meant to find', () => {
    expect(
      idReads('const { user } = useAuth();\nif (x === user?.id) {}'),
    ).toEqual(['user?.id']);
    expect(idReads('const { user: me, isAdmin } = useAuth();\nme.id;')).toEqual(
      ['me.id'],
    );
    expect(idReads('const { userId } = useAuth();\nuserId;')).toEqual([]);
  });

  it('no source file compares ids through the possibly-fallback user', () => {
    const offenders = sources(SRC).flatMap((file) =>
      idReads(readFileSync(file, 'utf8')).map(
        (read) => `${path.relative(SRC, file)}: ${read}`,
      ),
    );
    expect(offenders).toEqual([]);
  });
});

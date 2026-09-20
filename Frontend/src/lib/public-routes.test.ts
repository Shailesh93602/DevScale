import { describe, it, expect } from 'vitest';
import {
  ADMIN_ROUTE_PREFIXES,
  AUTH_REQUIRED_ROUTE_PREFIXES,
  GUEST_ONLY_ROUTE_PREFIXES,
  PUBLIC_ROUTE_PREFIXES,
  isGuestOnlyRoute,
  requiresAuthRoute,
  requiresAdminRoute,
  isPublicRoute,
} from './public-routes';

describe('route classification — the access-control matrix', () => {
  it('admin routes require auth AND admin', () => {
    expect(requiresAdminRoute('/admin')).toBe(true);
    expect(requiresAdminRoute('/admin/users')).toBe(true);
    expect(requiresAuthRoute('/admin')).toBe(true);
    expect(isPublicRoute('/admin')).toBe(false);
  });

  it('prefix matching does not bleed across sibling routes', () => {
    // '/articles' requires auth; '/article-listing' is public. A naive
    // startsWith('/articles') vs startsWith('/article') both get this wrong.
    expect(requiresAuthRoute('/articles')).toBe(true);
    expect(requiresAuthRoute('/articles/42')).toBe(true);
    expect(requiresAuthRoute('/article-listing')).toBe(false);
    expect(isPublicRoute('/article-listing')).toBe(true);
  });

  it('"/" is public but nothing else inherits from it', () => {
    expect(isPublicRoute('/')).toBe(true);
    // '/dashboard' must not be public just because '/' is a prefix of it
    expect(isPublicRoute('/dashboard')).toBe(false);
    expect(requiresAuthRoute('/dashboard')).toBe(true);
  });

  it('guest-only covers the auth pages and wins over public', () => {
    expect(isGuestOnlyRoute('/auth/login')).toBe(true);
    expect(isGuestOnlyRoute('/auth')).toBe(true);
    expect(isPublicRoute('/auth/login')).toBe(false);
  });

  it('null/undefined/empty paths are never granted anything', () => {
    for (const fn of [
      isGuestOnlyRoute,
      requiresAuthRoute,
      requiresAdminRoute,
      isPublicRoute,
    ]) {
      expect(fn(undefined)).toBe(false);
      expect(fn(null)).toBe(false);
      expect(fn('')).toBe(false);
    }
  });

  it('/moderate requires authentication, and is not public', () => {
    // It was in neither list, so middleware skipped it entirely and the page
    // shell rendered for anonymous visitors. Client-side RoleGuard is not a
    // server-side gate.
    expect(requiresAuthRoute('/moderate')).toBe(true);
    expect(isPublicRoute('/moderate')).toBe(false);
  });

  it('the anonymous read-only surface is public (2026-09-03 decision)', () => {
    for (const p of [
      '/career-roadmap',
      '/career-roadmap/roadmaps',
      '/career-roadmap/some-roadmap-slug',
      '/coding-challenges',
      '/battles/demo',
    ]) {
      expect(isPublicRoute(p), p).toBe(true);
      expect(requiresAuthRoute(p), p).toBe(false);
    }
  });

  it('the challenge editor is gated even though the list above it is public', () => {
    // A prefix list cannot say "this but not its children", so this is the
    // one pattern-based rule. Both spellings a visitor might reach.
    for (const p of [
      '/coding-challenges/abc123',
      '/coding-challenges/abc123/',
      '/coding-challenges/abc123/anything',
    ]) {
      expect(requiresAuthRoute(p), p).toBe(true);
      expect(isPublicRoute(p), p).toBe(false);
    }
    // ...and the pattern does not over-reach onto the list or a sibling.
    expect(requiresAuthRoute('/coding-challenges')).toBe(false);
    expect(requiresAuthRoute('/coding-challenges-archive')).toBe(false);
  });

  it('writes under the public surfaces still require auth', () => {
    for (const p of ['/create-battle', '/battle-zone', '/battle-zone/create']) {
      expect(requiresAuthRoute(p), p).toBe(true);
    }
  });

  it('an unlisted route is neither public nor protected — callers must decide', () => {
    expect(isPublicRoute('/totally-new-page')).toBe(false);
    expect(requiresAuthRoute('/totally-new-page')).toBe(false);
  });
});

/**
 * Invariants between the lists, rather than facts about individual paths.
 *
 * The file's own comment already states the first one ("These are also
 * included in AUTH_REQUIRED_ROUTE_PREFIXES") — but a comment is not a check,
 * and the consequence of breaking it is silent. `updateSession` takes its
 * public fast path for anything that is not auth-required and returns BEFORE
 * `requiresAdminRoute` is ever consulted, so an admin prefix missing from the
 * auth list does not get a weaker gate: it gets no server-side gate at all,
 * and a pass-through is indistinguishable from an allow.
 */
describe('invariants the lists must satisfy', () => {
  it('every admin prefix is also auth-required, or the edge gate never runs', () => {
    const ungated = ADMIN_ROUTE_PREFIXES.filter((p) => !requiresAuthRoute(p));
    expect(
      ungated,
      'these admin prefixes are skipped by the middleware fast path',
    ).toEqual([]);
  });

  it('every admin prefix is literally present in the auth-required list', () => {
    // Stronger than the check above, which a coincidental prefix overlap could
    // satisfy (e.g. '/admin-tools' matching nothing while '/admin' matches).
    const missing = ADMIN_ROUTE_PREFIXES.filter(
      (p) => !AUTH_REQUIRED_ROUTE_PREFIXES.includes(p),
    );
    expect(missing).toEqual([]);
  });

  it('no prefix is classified as both protected and public', () => {
    const contradictory = AUTH_REQUIRED_ROUTE_PREFIXES.filter((p) =>
      (PUBLIC_ROUTE_PREFIXES as readonly string[]).includes(p),
    );
    expect(contradictory).toEqual([]);
  });

  it('no guest-only prefix is also auth-required', () => {
    const contradictory = GUEST_ONLY_ROUTE_PREFIXES.filter((p) =>
      (AUTH_REQUIRED_ROUTE_PREFIXES as readonly string[]).includes(p),
    );
    expect(contradictory).toEqual([]);
  });

  it('classification is unambiguous: no prefix answers true to two categories', () => {
    for (const p of [
      ...ADMIN_ROUTE_PREFIXES,
      ...AUTH_REQUIRED_ROUTE_PREFIXES,
      ...PUBLIC_ROUTE_PREFIXES,
      ...GUEST_ONLY_ROUTE_PREFIXES,
    ]) {
      const answers = [
        isGuestOnlyRoute(p),
        requiresAuthRoute(p),
        isPublicRoute(p),
      ].filter(Boolean);
      expect(answers.length, `${p} matched ${answers.length} categories`).toBe(
        1,
      );
    }
  });
});

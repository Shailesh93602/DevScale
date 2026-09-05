import { describe, it, expect } from 'vitest';
import {
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

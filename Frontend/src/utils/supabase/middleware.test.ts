// @vitest-environment node
//
// NOT jsdom (this project's default). NextRequest validates that
// `request.headers` is a real `Headers`, and jsdom supplies its own
// incompatible implementation — the request cannot even be constructed there.
// Middleware runs on the server, so the server environment is also the honest
// one to test it in.
import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * The /admin edge gate.
 *
 * WHAT THIS EXISTS TO PREVENT — a real privilege escalation that shipped.
 *
 * The gate read:
 *
 *     user.app_metadata?.role || user.user_metadata?.role
 *
 * `app_metadata` is writable only with a service-role key. `user_metadata` is
 * writable by the USER, from the browser, with the publishable key:
 *
 *     await supabase.auth.updateUser({ data: { role: "ADMIN" } })
 *
 * supabase-js's own types say so — `app_metadata` is annotated "Only a service
 * role can modify", while `updateUser`'s `data` field "maps to the
 * auth.users.raw_user_meta_data column", which is what surfaces as
 * `user_metadata`. So any signed-in user could satisfy the gate.
 *
 * WHY THE TEST IS SHAPED THIS WAY.
 *
 * It drives `updateSession` — the function `middleware.ts` actually calls — and
 * asserts on the RESPONSE (a redirect, or a pass-through), not on some
 * extracted predicate. A test for an authorisation rule that checks a helper
 * rather than the request path is how this workspace previously left `/admin`
 * publicly reachable for months while a green test watched: the test imported
 * the module directly and passed against code the framework never loaded.
 *
 * Asserting the redirect means the only way to make this pass is for the real
 * entry point to refuse the request.
 */

const getUser = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser } }),
}));

import { NextRequest } from 'next/server';
import { updateSession } from './middleware';

function requestFor(path: string): NextRequest {
  return new NextRequest(new URL(`https://eduscale.vercel.app${path}`));
}

/** A signed-in user with whatever metadata the case is testing. */
function signedInAs(metadata: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}) {
  getUser.mockResolvedValue({
    data: {
      user: {
        id: 'user-1',
        app_metadata: metadata.app_metadata ?? {},
        user_metadata: metadata.user_metadata ?? {},
      },
    },
  });
}

/** Where the middleware sent the request, or null if it let it through. */
function redirectTarget(res: Response): string | null {
  const location = res.headers.get('location');
  return location ? new URL(location).pathname : null;
}

beforeEach(() => {
  getUser.mockReset();
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';
});

describe('/admin gate', () => {
  it('REFUSES a user who forged user_metadata.role — the escalation itself', async () => {
    // Exactly what `updateUser({ data: { role: "ADMIN" } })` produces. This is
    // the whole reason this file exists; if it ever passes, the hole is back.
    signedInAs({ app_metadata: {}, user_metadata: { role: 'ADMIN' } });

    const res = await updateSession(requestFor('/admin'));

    expect(redirectTarget(res)).toBe('/dashboard');
  });

  it('refuses a forged user_metadata.role even in mixed case', async () => {
    signedInAs({ user_metadata: { role: 'admin' } });
    expect(redirectTarget(await updateSession(requestFor('/admin')))).toBe(
      '/dashboard',
    );
  });

  it('refuses a forged role on a NESTED admin route', async () => {
    // The prefix matcher covers /admin/*; a gate that only guarded the index
    // would leave every sub-page open.
    signedInAs({ user_metadata: { role: 'ADMIN' } });
    expect(
      redirectTarget(await updateSession(requestFor('/admin/users'))),
    ).toBe('/dashboard');
  });

  it('ALLOWS a real admin — app_metadata.role, which only a service key can write', async () => {
    signedInAs({ app_metadata: { role: 'ADMIN' } });

    const res = await updateSession(requestFor('/admin'));

    // Not redirected: the request passes through.
    expect(redirectTarget(res)).toBeNull();
  });

  it('fails CLOSED when the claim is missing entirely', async () => {
    // A real admin whose app_metadata was never synced is refused too. That is
    // a configuration problem to fix loudly (grant-admin.ts), not a reason to
    // trust a weaker field — which is precisely the reasoning that produced
    // the bug.
    signedInAs({ app_metadata: {}, user_metadata: {} });
    expect(redirectTarget(await updateSession(requestFor('/admin')))).toBe(
      '/dashboard',
    );
  });

  it('refuses a non-admin role', async () => {
    signedInAs({ app_metadata: { role: 'STUDENT' } });
    expect(redirectTarget(await updateSession(requestFor('/admin')))).toBe(
      '/dashboard',
    );
  });

  it('sends an unauthenticated visitor to login, not to the panel', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect(redirectTarget(await updateSession(requestFor('/admin')))).toBe(
      '/auth/login',
    );
  });

  it('reaches the admin check at all — /admin is not skipped by the public fast path', async () => {
    // Load-bearing. The fast path returns BEFORE the admin block for anything
    // that is not auth-required, so if /admin ever fell out of
    // AUTH_REQUIRED_ROUTE_PREFIXES the gate would silently stop running and
    // every assertion above would still pass, because a pass-through and an
    // allow look identical.
    //
    // getUser being called is the proof the fast path did not fire.
    signedInAs({ app_metadata: { role: 'ADMIN' } });
    await updateSession(requestFor('/admin'));
    expect(getUser).toHaveBeenCalled();
  });
});

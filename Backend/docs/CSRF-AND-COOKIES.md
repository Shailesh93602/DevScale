# CSRF, cookies, and why every mutation was failing

**Written 2026-08-29**, after a user reported that liking a roadmap failed with
*"Failed to update like status"*.

The message was bad. The bug underneath it was much worse: **every
state-changing request from the deployed frontend was being rejected with 403.**

---

## The symptom, and why every test missed it

A like button showed an error. `qa/run.mjs` — the outcome-asserting API suite —
likes a roadmap and asserts 2xx, and it passes. 174 backend tests pass. 30
frontend spec files pass.

They all missed it for one reason: **`qa/run.mjs` calls the API from Node.**
There is no browser, so there are no cookies, no SameSite rules, and no
same-origin policy. It exercises the endpoint, not the situation the endpoint is
actually used in.

> A passing test proves the test passes. This one proved the API works when
> called the way the test calls it.

---

## The root cause

`main.ts` applied `verifyCsrfToken` globally. It implements the standard
**double-submit cookie** pattern:

```ts
const cookieToken = req.cookies['XSRF-TOKEN'];
const headerToken = req.headers['x-xsrf-token'];
if (!cookieToken || !headerToken || cookieToken !== headerToken) → 403
```

The frontend cooperates — it reads the cookie and echoes it:

```ts
const csrfToken = document.cookie.split('; ')
  .find((row) => row.trim().startsWith('XSRF-TOKEN='))?.split('=')[1];
if (csrfToken) config.headers['X-XSRF-TOKEN'] = csrfToken;
```

**That handshake cannot complete in this deployment**, for two independent
reasons — either alone is fatal:

1. **Different sites, not sibling subdomains.** The frontend is
   `eduscale.vercel.app`; the API is a different `*.vercel.app` deployment.
   `vercel.app` is on the [Public Suffix List](https://publicsuffix.org/), so
   those are separate registrable domains. `document.cookie` on the frontend
   **cannot see** a cookie set by the API's domain. Not "will not" — cannot.
2. **`sameSite: 'strict'`.** Even if the frontend could read it, the browser
   would not attach that cookie to a cross-site request.

So `cookieToken` was always `undefined`, the condition always failed, and every
`POST`/`PUT`/`DELETE` returned `403 CSRF_INVALID`.

**Blast radius:** likes, bookmarks, comments, replies, enrolments, quiz
submissions, article edits, moderation notes. Everything except reads.

---

## Why removing the global check is safe, not a weakening

CSRF is an attack on **ambient credentials** — something the browser attaches
automatically, so a forged cross-origin request inherits the victim's identity.

This API has none. `authMiddleware` reads exactly one thing:

```ts
const token = req.headers.authorization?.split(' ')[1];
```

An attacker's page cannot set an `Authorization` header on a cross-origin
request — the browser will not send it without a successful CORS preflight, and
the API's CORS policy will not grant one to an untrusted origin.

This is the standard position in the
[OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html):
a token-authenticated API that never reads credentials from cookies is not
CSRF-exposed.

### The one exception, which keeps its protection

`POST /api/v1/auth/refresh` reads `sb-refresh-token` from a cookie. That **is**
an ambient credential, so it is the one route where CSRF has something to
protect — and `verifyCsrfToken` is now applied there specifically, at the route,
instead of to everything.

---

## What is still wrong, and honestly

**The refresh cookie has the same topology problem.** `sb-refresh-token` is set
`httpOnly: true, sameSite: 'strict'` by the API's domain, so a cross-site
frontend never sends it either. The refresh flow cannot work as deployed.

That is not fixed here. It cannot be fixed by changing cookie attributes alone:
`sameSite: 'none'` would let the browser send it, but the frontend still could
not participate in double-submit, because it still cannot read a cookie from
another registrable domain.

### The real fix: make it same-origin

Serve the API through a Next.js rewrite so the browser sees one origin:

```js
// next.config.mjs
async rewrites() {
  return [{ source: '/api/:path*', destination: `${process.env.API_ORIGIN}/api/:path*` }];
}
```

Then cookies are first-party, `SameSite=Strict` works as intended, double-submit
works as designed, and the CORS configuration mostly stops mattering. It is a
smaller change than it sounds and it removes a whole category of problem rather
than working around it.

**Until then**, sessions rely on the Supabase client's own token refresh rather
than the cookie route, which is why nobody noticed the refresh endpoint was
unreachable.

---

## The lesson worth keeping

Three separate test layers passed while the deployed application could not
perform a single write.

Each layer was testing something real. None of them was testing **the
application as a browser encounters it**: cross-origin, with cookie rules, from
a different registrable domain than the API.

The gap was not coverage. It was that every layer ran in an environment more
forgiving than production.

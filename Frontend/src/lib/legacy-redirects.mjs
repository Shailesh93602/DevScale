/**
 * Edge redirects for the URLs people type by hand.
 *
 * The canonical auth pages are /auth/login and /auth/register. /login,
 * /register, /signup and /sign-up are what a visitor guesses — and what a
 * recruiter guessed on 2026-09-03, finding /login answering 200 with an empty
 * shell and /register answering 404.
 *
 * Two page stubs (src/app/login, src/app/signup) already called
 * `permanentRedirect()` for two of the four. They did not work as a redirect
 * on the deployed site: the root layout streams, so by the time the stub ran
 * the 200 and the shell were already on the wire and the redirect degraded to
 * a client-side hop that a curl — or a crawler — never follows. /register and
 * /sign-up had no stub at all.
 *
 * `redirects()` in next.config runs at the edge before any rendering, so the
 * status is a real 308 and every client sees it. Plain .mjs rather than .ts
 * so next.config.mjs can import it directly and the unit test can too.
 */
export const legacyRedirects = [
  { source: '/login', destination: '/auth/login', permanent: true },
  { source: '/register', destination: '/auth/register', permanent: true },
  { source: '/signup', destination: '/auth/register', permanent: true },
  { source: '/sign-up', destination: '/auth/register', permanent: true },
];

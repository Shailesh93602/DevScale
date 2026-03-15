# Editorial — CSRF Protection Middleware

## Problem Summary
Protect an Express server from **Cross-Site Request Forgery (CSRF)** by implementing a middleware that validates a secret token for state-changing requests.

## What is CSRF?
CSRF is an attack where an attacker tricks a user's browser into sending a request to a website where the user is already authenticated. Because browsers automatically include cookies for the site, the site thinks the request is legitimate.

To prevent this, we use a **Synchronization Token Pattern**. We generate a random secret token, store it in the user's session, and require the client to send that same token in a custom header (which browsers don't automatically populate).

## Approach: Request Interception
Middleware functions have access to the `Request` and `Response` objects. Our logic follows these steps:

1. **Filtering**: We only care about "unsafe" methods like `POST`, `PUT`, etc. `GET` requests should be idempotent (read-only) and generally don't need CSRF protection.
2. **Extraction**: We retrieve the token from the `X-CSRF-TOKEN` header and the `req.session.csrfToken`.
3. **Comparison**: If they don't match, we immediately terminate the request with a `403` status.
4. **Pass-through**: If they match, we call `next()` to allow the request to reach the route handler.

## Security Best Practices
- **Randomness**: The token should be a cryptographically secure random string.
- **Strict Headers**: Using a custom header like `X-CSRF-TOKEN` provides extra protection because it forces a CORS pre-flight check for cross-origin requests.
- **SameSite Cookies**: Moving forward, using `SameSite=Lax` or `SameSite=Strict` on cookies is the first line of defense, but the token-based middleware remains a standard "defense in depth" practice.

## Complexity
- **Time Complexity**: $O(1)$, as it's a simple lookup and comparison.
- **Space Complexity**: $O(1)$ per request.

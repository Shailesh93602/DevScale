# CSRF Protection Middleware

**Cross-Site Request Forgery (CSRF)** is an attack that forces an authenticated user to execute unwanted actions on a web application in which they're currently authenticated.

Your task is to implement an Express.js middleware function `csrfProtection` that validates a CSRF token for all state-changing HTTP requests.

### Requirements:
1. **Methods to Protect**: The middleware should only validate tokens for "unsafe" methods: `POST`, `PUT`, `DELETE`, and `PATCH`. Safe methods like `GET`, `HEAD`, and `OPTIONS` do not require a CSRF token.
2. **Token Extraction**: The CSRF token should be expected in the custom request header: `X-CSRF-TOKEN`.
3. **Validation Logic**:
   - Compare the token from the header with the one stored in the user's session (accessible via `req.session.csrfToken`).
   - If they match, call `next()` to proceed.
   - If the token is missing, invalid, or doesn't match, return a `403 Forbidden` response with the message: `"Invalid or missing CSRF token"`.

### Example Scenario:
- **Valid Request**:
  - `POST /update-profile`
  - Header `X-CSRF-TOKEN: "xyz123"`
  - `req.session.csrfToken: "xyz123"`
  - Result: Calls `next()`.
- **Invalid Request**:
  - `POST /delete-account`
  - Header `X-CSRF-TOKEN: "wrong"`
  - `req.session.csrfToken: "xyz123"`
  - Result: `res.status(403).send("Invalid or missing CSRF token")`.

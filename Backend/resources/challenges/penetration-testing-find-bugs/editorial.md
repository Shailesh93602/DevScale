# Editorial — Security Code Review: Find the Bugs

### 1. SQL Injection (Line 6)
**The Flaw**: String concatenation in queries.
**The Fix**: Use parameterized queries (prepared statements).
```javascript
// Good
db.query('SELECT * FROM users WHERE id = ?', [req.query.id]);
```

### 2. Reflected XSS (Line 7)
**The Flaw**: Data from the database (username) is trusted as safe HTML. If a user sets their username to `<script>alert(1)</script>`, this script will run on every profile view.
**The Fix**: Use a template engine that auto-escapes (like EJS or Pug) or use a library to encode HTML entities.

### 3. SSRF (Line 11)
**The Flaw**: Allowing the server to make requests to any URL. An attacker could provide `http://localhost:8080/admin` or `http://169.254.169.254/latest/meta-data/` to access sensitive internal data.
**The Fix**: Implement a whitelist of allowed domains or protocols, and block internal IP ranges.

### 4. IDOR / Broken Access Control (Line 18)
**The Flaw**: The application trusts the `id` provided in the request body to identify which user to update. Since `isLoggedIn` is a global check, any logged-in user can pass any other user's `id`.
**The Fix**: Always use the identity stored in the server-side session:
```javascript
// Good
await db.query('UPDATE users SET email = ? WHERE id = ?', [req.body.email, req.session.userId]);
```


# Editorial -- Prevent SQL Injection

## Problem Summary

Convert vulnerable SQL queries that use string concatenation to secure parameterized queries, and implement input validation to detect and reject SQL injection attempts.

---

## Approach 1 -- Parameterized Queries (Primary Defense)

```typescript
// VULNERABLE
const query = `SELECT * FROM users WHERE username = '${username}'`;

// SECURE
const query = "SELECT * FROM users WHERE username = $1";
const params = [username];
```

The database driver treats parameters as data, never as SQL code. Even if the input contains SQL keywords, they are treated as literal strings.

## Approach 2 -- Input Validation (Defense in Depth)

```typescript
function detectSQLInjection(input: string): boolean {
  const patterns = [
    /('\s*(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(;\s*(DROP|DELETE|UPDATE|INSERT))/i,
    /(\bUNION\b\s+SELECT\b)/i,
    /('--)/,
  ];
  return patterns.some(p => p.test(input));
}
```

## Approach 3 -- ORM (Highest Level)

```typescript
// Prisma - automatically parameterized
const user = await prisma.user.findUnique({ where: { username } });
```

---

## Key Concepts

- **Parameterized queries** separate SQL logic from data
- **Input validation** is defense-in-depth, not primary defense
- **Allowlisting** is safer than blocklisting
- **ORMs** provide built-in protection

## Common Mistakes

- String concatenation "just this once"
- Relying only on input sanitization
- Not validating numeric inputs
- Blocklist approach (easily bypassed)

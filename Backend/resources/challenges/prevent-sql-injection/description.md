# Prevent SQL Injection

SQL injection is one of the most common and dangerous web vulnerabilities (OWASP Top 10 #3). Your task is to identify vulnerable SQL queries and rewrite them using secure patterns.

## Problem

Given vulnerable SQL query patterns that concatenate user input directly into SQL strings, transform them into secure parameterized queries. Additionally, implement input validation functions that reject malicious input.

---

## Requirements

1. **Parameterized Queries**: Convert string-concatenated queries to use `?` placeholders with separate parameter arrays
2. **Input Validation**: Validate that inputs match expected patterns (e.g., usernames are alphanumeric, IDs are integers)
3. **Detection**: Identify common SQL injection patterns in user input (`' OR 1=1`, `; DROP TABLE`, `UNION SELECT`, etc.)

---

## Examples

**Example 1 -- Basic Injection:**
```text
Vulnerable:
  "SELECT * FROM users WHERE username = '" + input + "'"

Attack: input = "' OR '1'='1"
Result: SELECT * FROM users WHERE username = '' OR '1'='1'  (returns all users!)

Secure:
  query: "SELECT * FROM users WHERE username = ?"
  params: [input]
```

**Example 2 -- Login Bypass:**
```text
Vulnerable:
  "SELECT * FROM users WHERE email = '" + email + "' AND password = '" + pwd + "'"

Attack: email = "admin'--", pwd = "anything"
Result: SELECT * FROM users WHERE email = 'admin'--' AND password = 'anything'

Secure:
  query: "SELECT * FROM users WHERE email = ? AND password = ?"
  params: [email, pwd]
```

**Example 3 -- UNION Attack:**
```text
Vulnerable:
  "SELECT name, price FROM products WHERE id = " + id

Attack: id = "1 UNION SELECT username, password FROM users"

Secure:
  query: "SELECT name, price FROM products WHERE id = ?"
  params: [parseInt(id)]
```

---

## Constraints

- All user inputs must be parameterized, never concatenated
- Numeric inputs must be validated as numbers before use
- Input validation must reject strings containing SQL keywords in suspicious contexts
- Solutions must work with PostgreSQL parameter syntax ($1, $2) or MySQL syntax (?)

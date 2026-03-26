# Find All Security Vulnerabilities

In this challenge, you are acting as a Security Engineer performing a code review. Below is a snippet of a Node.js/Express application that handles user profiles and search.

The code contains exactly **4 major security vulnerabilities** (OWASP Top 10). Your task is to identify them.

### The Vulnerable Code:

```javascript
1:  const express = require('express');
2:  const router = express.Router();
3:  const db = require('./database');
4:  
5:  router.get('/profile', async (req, res) => {
6:    const user = await db.query(`SELECT * FROM users WHERE id = ${req.query.id}`);
7:    res.send(`<h1>Welcome, ${user.username}</h1>`);
8:  });
9:  
10: router.get('/debug-fetch', async (req, res) => {
11:   const response = await fetch(req.query.url);
12:   const data = await response.json();
13:   res.json(data);
14: });
15: 
16: router.post('/update-email', async (req, res) => {
17:   if (req.session.isLoggedIn) {
18:     await db.query('UPDATE users SET email = ? WHERE id = ?', [req.body.email, req.body.id]);
19:     res.send('Email updated!');
20:   }
21: });
```

### Your Task:
Identify the vulnerability type and the line number for each of the 4 flaws.

### Example Answer Format:
```json
[
  { "line": 5, "type": "SQL Injection", "reason": "..." },
  ...
]
```

### Constraints:
- Vulnerabilities are standard OWASP categories (SQLi, XSS, SSRF, IDOR/Broken Access Control).

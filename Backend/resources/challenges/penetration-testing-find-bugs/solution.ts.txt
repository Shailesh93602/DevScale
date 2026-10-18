const vulnerabilities = [
  {
    line: 6,
    type: "SQL Injection",
    description: "User input from req.query.id is directly concatenated into the SQL query string."
  },
  {
    line: 7,
    type: "Cross-Site Scripting (XSS)",
    description: "user.username is rendered directly into the HTML without sanitization or encoding."
  },
  {
    line: 11,
    type: "Server-Side Request Forgery (SSRF)",
    description: "The server fetches an arbitrary URL provided by the user (req.query.url) allowing internal network scanning or metadata access."
  },
  {
    line: 18,
    type: "Insecure Direct Object Reference (IDOR)",
    description: "The update-email endpoint checks if the user is logged in, but uses req.body.id from the request instead of req.session.userId, allowing a user to update any other user's email."
  }
];

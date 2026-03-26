# Prevent Cross-Site Scripting (XSS)

Cross-Site Scripting (XSS) is a type of security vulnerability where an attacker injects malicious scripts into content from otherwise trusted websites.

One of the primary ways to prevent XSS is to **sanitize** user-provided data before rendering it in the browser. This usually involves "escaping" special characters that have meaning in HTML.

### Task:
Implement a function `sanitizeHTML(input)` that takes a string of untrusted input and returns a sanitized version of the string where the following characters are replaced with their HTML entity equivalents:

- `&` becomes `&amp;`
- `<` becomes `&lt;`
- `>` becomes `&gt;`
- `"` becomes `&quot;`
- `'` becomes `&#39;`
- `/` becomes `&#x2F;`

### Example 1:
**Input:** `<script>alert('xss')</script>`
**Output:** `&lt;script&gt;alert(&#39;xss&#39;)&lt;&#x2F;script&gt;`

### Example 2:
**Input:** `Hello & Goodbye`
**Output:** `Hello &amp; Goodbye`

### Constraints:
- `1 <= input.length <= 10^4`
- Input consists of printable ASCII characters.

# Editorial — Prevent Cross-Site Scripting (XSS)

### Understanding the Risk
XSS occurs when an application includes untrusted data in a web page without proper validation or escaping. If the browser interprets this data as code (HTML/JavaScript), the attacker can hijack sessions, deface websites, or redirect users.

### The Defense: Output Escaping
The most reliable way to prevent XSS is to ensure that the browser treats data as **plain text** rather than code. We do this by converting "meta-characters" into inert HTML entities.

| Character | Entity | Why? |
| :--- | :--- | :--- |
| `<` | `&lt;` | Prevents starting a new HTML tag |
| `>` | `&gt;` | Prevents closing an existing HTML tag |
| `&` | `&amp;` | Prevents entity manipulation |
| `"` | `&quot;` | Prevents breaking out of attribute values (e.g., `src="..."`) |
| `'` | `&#39;` | Prevents breaking out of attribute values |
| `/` | `&#x2F;` | Helps prevent breaking out of tags in some older browsers |

### Implementation Strategy
The most efficient way to perform this replacement in JavaScript/TypeScript is using a regular expression with the `g` (global) flag and a lookup table.

```typescript
function sanitizeHTML(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ...
  };
  return input.replace(/[&<>"'/]/g, (m) => map[m]);
}
```

### Complexity Analysis
- **Time Complexity**: $O(N)$ where $N$ is the length of the string. We iterate through the string once to find and replace.
- **Space Complexity**: $O(N)$ to create the new sanitized string.

# Editorial — Implement OAuth 2.0 Authorization Code Flow

### The "Why" behind the 3-Legged Flow
The Authorization Code flow is often called the "3-legged" flow because it involves the Client Application, the User, and the Authorization Server. 
The reason we don't just send the password to the App is **Trust**: the app never sees the user's secret credentials. And the reason we use a two-step `code -> token` exchange rather than sending the token directly in the URL (Implicit Flow) is **Security**:
1.  **URL Logging**: Access tokens in the browser URL can be leaked via browser history or `Referer` headers.
2.  **Server-to-Server**: The code exchange happens on the backchannel (server-to-server), meaning the client secret and the actual access token are never exposed to the user's browser.

### Security Checkpoints in Implementation

1.  **State Parameter**: This is an opaque value used by the client to maintain state between the request and callback. The Authorization Server must include this exact value in the redirect. This protects against **CSRF (Cross-Site Request Forgery)**.
2.  **Redirect URI Validation**: You MUST validate the `redirect_uri` against a pre-registered whitelist. An attacker could otherwise redirect the authorization code to their own server.
3.  **Code Mismatch**: When exchanging the code for a token, you must verify that the `redirect_uri` is the same as the one used in the initial request. This prevents "Code Injection" attacks.
4.  **Single-Use Codes**: Authorization codes must be deleted as soon as they are used. If a code is presented twice, the server should ideally revoke all tokens associated with that code, as it indicates a potential theft.

### Modern Addition: PKCE
For mobile and single-page apps (where client secrets cannot be stored securely), we use **PKCE** (Proof Key for Code Exchange). Instead of a secret, the client generates a random `code_verifier`, sends its hash (`code_challenge`) in the first step, and the raw verifier in the second step.

### Complexity Analysis
- **Time Complexity**: $O(1)$ for map lookups and token generation.
- **Space Complexity**: $O(C)$ where $C$ is the number of active, non-expired authorization codes.


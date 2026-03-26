# Implement OAuth 2.0 Authorization Code Flow

OAuth 2.0 is the industry-standard protocol for authorization. The **Authorization Code Flow** is the most commonly used flow, designed for secure server-side applications.

In this challenge, you will implement the logic for an Authorization Server that handles two main endpoints:
1.  **`/authorize`**: Validates the request and returns an `authorization_code`.
2.  **`/token`**: Exchanges the `authorization_code` for an `access_token`.

### The Flow Steps:
1.  **Client Application** redirects the user to the Authorization Server.
2.  **Authorization Server** validates the `client_id` and `redirect_uri`, then issues an `authorization_code`.
3.  **Client Application** sends a POST request to the `/token` endpoint with the `authorization_code`, `client_secret`, and `redirect_uri`.
4.  **Authorization Server** validates the code and secret, then returns an `access_token`.

### Requirements:
- Handle `state` parameter to prevent CSRF.
- Implement expiration for Authorization Codes (codes should only be valid once and for a short time).
- Validate that the `redirect_uri` in the token phase matches the one used in the authorization phase.

### Example
**Input (Authorize)**:
`{ "client_id": "abc", "redirect_uri": "https://callback.com", "state": "xyz" }`
**Output**: 
`{ "code": "AUTH_CODE_123", "state": "xyz" }`

**Input (Token)**:
`{ "client_id": "abc", "client_secret": "secret123", "code": "AUTH_CODE_123", "redirect_uri": "https://callback.com" }`
**Output**:
`{ "access_token": "JWT_TOKEN_456", "token_type": "Bearer", "expires_in": 3600 }`

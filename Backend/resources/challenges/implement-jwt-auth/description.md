# Implement JWT Authentication

## Problem Description

Implement a complete JWT (JSON Web Token) authentication system for a Node.js/Express API. The system should handle user registration, login, token verification, token refresh, and protecting routes with authentication middleware.

## Requirements

### Functional Requirements
1. **User Registration**: Register users with email and password (password hashed with bcrypt)
2. **User Login**: Authenticate users and return access + refresh tokens
3. **Token Verification**: Middleware to verify JWT tokens on protected routes
4. **Token Refresh**: Exchange a valid refresh token for a new token pair
5. **Logout**: Invalidate refresh tokens on logout

### API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login and get tokens |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | Yes | Invalidate refresh token |
| GET | `/api/profile` | Yes | Get user profile (protected) |

### Token Structure

**Access Token Payload:**
```typescript
{
  userId: string;
  email: string;
  role: string;
  iat: number;    // issued at
  exp: number;    // expires at (1 hour)
}
```

**Refresh Token Payload:**
```typescript
{
  userId: string;
  tokenId: string; // unique ID for revocation
  iat: number;
  exp: number;     // expires at (7 days)
}
```

## Examples

### Example 1: Register
**Input:**
```
POST /auth/register
{ "email": "alice@example.com", "password": "Str0ng!Pass", "name": "Alice" }
```
**Output (201):**
```json
{
  "user": { "id": "uuid-1", "email": "alice@example.com", "name": "Alice" },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

### Example 2: Login
**Input:**
```
POST /auth/login
{ "email": "alice@example.com", "password": "Str0ng!Pass" }
```
**Output (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

### Example 3: Access Protected Route
**Input:**
```
GET /api/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
**Output (200):**
```json
{
  "id": "uuid-1",
  "email": "alice@example.com",
  "name": "Alice"
}
```

### Example 4: Expired Token
**Input:**
```
GET /api/profile
Authorization: Bearer <expired-token>
```
**Output (401):**
```json
{
  "error": "Token expired",
  "statusCode": 401
}
```

## Constraints

- Passwords must be at least 8 characters with mixed case and a number
- Passwords must be hashed using bcrypt with salt rounds >= 10
- Access tokens expire in 1 hour (3600 seconds)
- Refresh tokens expire in 7 days
- Use HS256 algorithm for JWT signing
- Store refresh tokens to enable revocation
- Return 401 for invalid/expired tokens, 403 for insufficient permissions

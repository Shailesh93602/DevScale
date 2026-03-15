# Editorial: Implement JWT Authentication

## Approach Overview

JWT authentication involves three main parts: token generation on login, token verification on each request, and token refresh for seamless session management. The critical security aspects are password hashing, token signing, and proper expiration handling.

## Key Concepts

### JWT Structure
A JWT consists of three parts: Header, Payload, and Signature, each Base64-encoded and separated by dots.

### Token Pair Strategy
- **Access Token**: Short-lived (1 hour), sent with every request
- **Refresh Token**: Long-lived (7 days), stored securely, used only to get new access tokens

This minimizes risk: if an access token is compromised, the window of vulnerability is small.

## Implementation

### Step 1: Password Hashing

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Step 2: Token Generation

```typescript
import jwt from 'jsonwebtoken';

function generateAccessToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );
}

function generateRefreshToken(user: User): string {
  const tokenId = crypto.randomUUID();
  return jwt.sign(
    { userId: user.id, tokenId },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
}
```

### Step 3: Auth Middleware

```typescript
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Step 4: Token Refresh with Rotation

```typescript
async function refresh(refreshToken: string): Promise<TokenPair> {
  const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

  // Check if token has been revoked
  const isRevoked = await isTokenRevoked(payload.tokenId);
  if (isRevoked) throw new Error('Token revoked');

  const user = await findUserById(payload.userId);

  // Revoke old refresh token (rotation)
  await revokeToken(payload.tokenId);

  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}
```

## Security Best Practices

1. **Never store passwords in plain text** - Always use bcrypt
2. **Use different secrets** for access and refresh tokens
3. **Implement token rotation** - Issue new refresh token on each refresh
4. **Store refresh tokens** in database to enable revocation
5. **Set appropriate expiration times** - Short for access, longer for refresh
6. **Use HTTPS** in production
7. **Validate password strength** on registration

## Complexity Analysis

- **Register**: O(1) + bcrypt hashing time (~100ms for 12 rounds)
- **Login**: O(1) lookup + bcrypt compare + JWT sign
- **Verify Token**: O(1) JWT verification
- **Refresh**: O(1) JWT verify + DB lookup for revocation check

## Common Pitfalls

1. Storing JWTs in localStorage (XSS vulnerable) - use httpOnly cookies for refresh tokens
2. Not implementing token revocation
3. Using the same secret for access and refresh tokens
4. Not validating password strength
5. Returning different error messages for "user not found" vs "wrong password" (information leakage)

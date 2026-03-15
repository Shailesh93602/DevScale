// Implement JWT Authentication - Reference Solution

import * as crypto from 'crypto';

// Simulated bcrypt (in production, use the bcrypt library)
class BcryptSimulator {
  static async hash(password: string, saltRounds: number): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, saltRounds * 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  static async compare(password: string, stored: string): Promise<boolean> {
    const [salt, hash] = stored.split(':');
    const verify = crypto.pbkdf2Sync(password, salt, 12000, 64, 'sha512').toString('hex');
    return hash === verify;
  }
}

// Simulated JWT (in production, use jsonwebtoken library)
class JWTSimulator {
  static sign(payload: object, secret: string, expiresInSeconds: number): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = { ...payload, iat: now, exp: now + expiresInSeconds };

    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    return `${headerB64}.${payloadB64}.${signature}`;
  }

  static verify(token: string, secret: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');

    const [headerB64, payloadB64, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSignature) throw new Error('Invalid token signature');

    // Decode and check expiration
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      const err = new Error('Token expired');
      (err as any).name = 'TokenExpiredError';
      throw err;
    }

    return payload;
  }
}

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Authentication Service
class AuthService {
  private users: Map<string, User> = new Map();
  private revokedTokens: Set<string> = new Set();

  private readonly ACCESS_SECRET = 'access-secret-key-change-in-production';
  private readonly REFRESH_SECRET = 'refresh-secret-key-change-in-production';
  private readonly ACCESS_EXPIRY = 3600;       // 1 hour
  private readonly REFRESH_EXPIRY = 604800;    // 7 days
  private readonly SALT_ROUNDS = 12;

  // Register a new user
  async register(email: string, password: string, name: string): Promise<{ user: Omit<User, 'passwordHash'>; tokens: TokenPair }> {
    if (!email || !this.isValidEmail(email)) {
      throw new AuthError('Invalid email address', 400);
    }
    if (!this.isStrongPassword(password)) {
      throw new AuthError('Password must be at least 8 characters with uppercase, lowercase, and a number', 400);
    }

    const existingUser = Array.from(this.users.values()).find(u => u.email === email);
    if (existingUser) {
      throw new AuthError('Email already registered', 409);
    }

    const passwordHash = await BcryptSimulator.hash(password, this.SALT_ROUNDS);
    const user: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role: 'user',
      passwordHash,
    };

    this.users.set(user.id, user);
    const tokens = this.generateTokenPair(user);

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      tokens,
    };
  }

  // Login with email and password
  async login(email: string, password: string): Promise<TokenPair> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user) {
      throw new AuthError('Invalid email or password', 401);
    }

    const isPasswordValid = await BcryptSimulator.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthError('Invalid email or password', 401);
    }

    return this.generateTokenPair(user);
  }

  // Verify an access token
  verifyAccessToken(token: string): TokenPayload {
    try {
      return JWTSimulator.verify(token, this.ACCESS_SECRET);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AuthError('Token expired', 401);
      }
      throw new AuthError('Invalid token', 401);
    }
  }

  // Refresh tokens
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    let payload: any;
    try {
      payload = JWTSimulator.verify(refreshToken, this.REFRESH_SECRET);
    } catch {
      throw new AuthError('Invalid refresh token', 401);
    }

    if (this.revokedTokens.has(payload.tokenId)) {
      throw new AuthError('Refresh token has been revoked', 401);
    }

    this.revokedTokens.add(payload.tokenId);

    const user = this.users.get(payload.userId);
    if (!user) {
      throw new AuthError('User not found', 401);
    }

    return this.generateTokenPair(user);
  }

  // Logout
  logout(refreshToken: string): void {
    try {
      const payload = JWTSimulator.verify(refreshToken, this.REFRESH_SECRET);
      this.revokedTokens.add(payload.tokenId);
    } catch {
      // Token already invalid
    }
  }

  // Auth middleware
  authenticateMiddleware() {
    return (req: any, res: any, next: any) => {
      const authHeader = req.headers?.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided', statusCode: 401 });
      }

      const token = authHeader.slice(7);
      try {
        const payload = this.verifyAccessToken(token);
        req.user = payload;
        next();
      } catch (err: any) {
        return res.status(401).json({ error: err.message, statusCode: 401 });
      }
    };
  }

  private generateTokenPair(user: User): TokenPair {
    const tokenId = crypto.randomUUID();

    const accessToken = JWTSimulator.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.ACCESS_SECRET,
      this.ACCESS_EXPIRY
    );

    const refreshToken = JWTSimulator.sign(
      { userId: user.id, tokenId },
      this.REFRESH_SECRET,
      this.REFRESH_EXPIRY
    );

    return { accessToken, refreshToken, expiresIn: this.ACCESS_EXPIRY };
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isStrongPassword(password: string): boolean {
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    );
  }
}

class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export { AuthService, AuthError, TokenPair, TokenPayload };

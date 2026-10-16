// Runs before every test file's imports (jest `setupFiles`).
//
// config/index.ts calls dotenv, which loads Backend/.env — and that file's
// REDIS_URL is the production Upstash instance. cacheService and rateLimiter
// connect at import time, and jest-setup.ts imports both for teardown, so
// every test file opened a connection to production Redis regardless of its
// own jest.mock calls. dotenv never overrides a variable that is already set,
// so pinning it here wins. Port 1 refuses immediately; no test needs Redis.
process.env.REDIS_URL = 'redis://127.0.0.1:1';

// Stand-in for Supabase Auth for the local realtime proof: signs ES256 tokens with a key made at startup,
// serves its JWKS, /auth/v1/user, token refresh and POST /__test/session {sub,email}. 127.0.0.1 only.
// Steps: Backend/docs/REALTIME_HOSTING.md, "Local proof".
import http from 'node:http';
import { exportJWK, generateKeyPair, SignJWT, jwtVerify } from 'jose';

const PORT = Number(process.env.FAKE_AUTH_PORT || 54399);
const ISSUER = `http://127.0.0.1:${PORT}/auth/v1`;
const TTL_SECONDS = 3600;

const { publicKey, privateKey } = await generateKeyPair('ES256');
const jwk = {
  ...(await exportJWK(publicKey)),
  kid: 'local-rt',
  alg: 'ES256',
  use: 'sig',
};

/** sub → profile, so a refresh or /user call can rebuild the user. */
const users = new Map();

function userObject(sub) {
  const p = users.get(sub);
  if (!p) return null;
  return {
    id: sub,
    aud: 'authenticated',
    role: 'authenticated',
    email: p.email,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { first_name: p.first_name, last_name: p.last_name },
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };
}

async function session(sub) {
  const u = userObject(sub);
  const now = Math.floor(Date.now() / 1000);
  const access_token = await new SignJWT({
    email: u.email,
    role: 'authenticated',
    aud: 'authenticated',
    user_metadata: u.user_metadata,
    app_metadata: u.app_metadata,
  })
    .setProtectedHeader({ alg: 'ES256', kid: jwk.kid, typ: 'JWT' })
    .setSubject(sub)
    .setIssuer(ISSUER)
    .setIssuedAt(now)
    .setExpirationTime(now + TTL_SECONDS)
    .sign(privateKey);
  return {
    access_token,
    token_type: 'bearer',
    expires_in: TTL_SECONDS,
    expires_at: now + TTL_SECONDS,
    refresh_token: `rt-${sub}`,
    user: u,
  };
}

function send(req, res, status, body) {
  const origin = req.headers.origin;
  res.writeHead(status, {
    'Content-Type': 'application/json',
    ...(origin && {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers':
        req.headers['access-control-request-headers'] || '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    }),
  });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function bearerSub(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, publicKey, { issuer: ISSUER });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, ISSUER);
  if (req.method === 'OPTIONS') return send(req, res, 204);

  if (url.pathname === '/auth/v1/.well-known/jwks.json') {
    return send(req, res, 200, { keys: [jwk] });
  }
  if (url.pathname === '/auth/v1/user' && req.method === 'GET') {
    const sub = await bearerSub(req);
    const u = sub && userObject(sub);
    if (!u) return send(req, res, 401, { code: 401, msg: 'invalid JWT' });
    return send(req, res, 200, u);
  }
  if (url.pathname === '/auth/v1/token') {
    const body = await readJson(req);
    const sub = String(body.refresh_token || '').replace(/^rt-/, '');
    if (!users.has(sub)) {
      return send(req, res, 400, { error: 'invalid_grant' });
    }
    return send(req, res, 200, await session(sub));
  }
  if (url.pathname === '/auth/v1/logout') return send(req, res, 204);

  if (url.pathname === '/__test/session' && req.method === 'POST') {
    const body = await readJson(req);
    if (!body.sub || !body.email) {
      return send(req, res, 400, { error: 'sub and email are required' });
    }
    users.set(body.sub, {
      email: body.email,
      first_name: body.first_name || 'Player',
      last_name: body.last_name || 'Local',
    });
    return send(req, res, 200, await session(body.sub));
  }

  return send(req, res, 404, {
    error: `no route ${req.method} ${url.pathname}`,
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`fake supabase auth on http://127.0.0.1:${PORT}`);
});

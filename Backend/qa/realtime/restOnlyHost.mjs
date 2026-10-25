// The Vercel half, locally: the Express app api/index.ts exports, served without App.start(),
// so no Socket.io, no battle timers, no Bull. A battle write routed here would stall the proof.
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const { default: app } = await import(
  path.join(here, '..', '..', 'dist', 'main.js')
);

const { default: prisma } = await import(
  path.join(here, '..', '..', 'dist', 'lib', 'prisma.js')
);

// Users whose email starts with rt-cold- get 503 here until they have a row (a failing first
// REST call), so only the realtime host's socket handshake can create it.
const claimsOf = (auth) => {
  try {
    const payload = auth.split(' ')[1].split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    return {};
  }
};
const handler = async (req, res) => {
  const { sub, email } = claimsOf(req.headers.authorization ?? '');
  const cold = typeof email === 'string' && email.startsWith('rt-cold-');
  if (
    cold &&
    !(await prisma.user.findUnique({ where: { supabase_id: sub } }))
  ) {
    res.writeHead(503, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Expose-Headers': 'x-rt-injected',
      'x-rt-injected': '1',
    });
    return res.end('{"success":false,"message":"injected: no user row yet"}');
  }
  return app(req, res);
};

const port = Number(process.env.PORT || 4056);
http.createServer(handler).listen(port, '127.0.0.1', () => {
  console.log(`REST-only (serverless-like) host on http://127.0.0.1:${port}`);
});

// The Vercel half, locally: the Express app api/index.ts exports, served without App.start(),
// so no Socket.io, no battle timers, no Bull. A battle write routed here would stall the proof.
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const { default: app } = await import(
  path.join(here, '..', '..', 'dist', 'main.js')
);

const port = Number(process.env.PORT || 4056);
http.createServer(app).listen(port, '127.0.0.1', () => {
  console.log(`REST-only (serverless-like) host on http://127.0.0.1:${port}`);
});

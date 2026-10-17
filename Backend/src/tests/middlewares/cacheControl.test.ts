// eduscale-backend#23-03 / #24-11 — what cacheResponse stores, and under which key.
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import express, { Request, Response } from 'express';
import Joi from 'joi';
import type { AddressInfo } from 'node:net';

const store = new Map<string, unknown>();
jest.mock('../../services/cacheService', () => ({
  getCache: async (k: string) => (store.has(k) ? store.get(k) : null),
  setCache: async (k: string, v: unknown) => void store.set(k, v),
  deleteCache: async () => undefined,
}));

import { cacheResponse } from '../../middlewares/cacheControl';
import { validateQuery } from '../../middlewares/validateRequest';

let status = 200;
let hits = 0;
const handler = (_req: Request, res: Response) => {
  hits++;
  res.status(status).json({ success: status < 400, n: hits });
};

async function get(app: express.Express, url: string) {
  const server = app.listen(0);
  try {
    const { port } = server.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${port}${url}`);
    return { status: res.status, body: await res.json() };
  } finally {
    server.close();
  }
}

beforeEach(() => {
  store.clear();
  hits = 0;
  status = 200;
});

describe('cacheResponse', () => {
  it('does not cache an error response and replay it as a 200', async () => {
    const app = express();
    app.get('/x', cacheResponse({ duration: 60 }), handler);
    status = 500;
    await get(app, '/x');
    status = 200;
    const second = await get(app, '/x');
    expect(store.size).toBe(1);
    expect(second.body).toEqual({ success: true, n: 2 });
  });

  it('namespaces keys so a repository entry under the same name is never replayed', async () => {
    store.set('roadmap:detail:r1:anon', { raw: 'repository object' });
    const app = express();
    app.get(
      '/r',
      cacheResponse({ duration: 60, key: () => 'roadmap:detail:r1:anon' }),
      handler
    );
    const res = await get(app, '/r');
    expect(res.body).toEqual({ success: true, n: 1 });
    expect(store.has('http:roadmap:detail:r1:anon')).toBe(true);
  });

  it('keys on the validated query, so junk params do not mint new entries', async () => {
    const app = express();
    app.get(
      '/list',
      validateQuery(Joi.object({ page: Joi.number() })),
      cacheResponse({ duration: 60 }),
      handler
    );
    await get(app, '/list?page=1&junk=a');
    await get(app, '/list?page=1&junk=b');
    expect(store.size).toBe(1);
    expect(hits).toBe(1);
  });
});

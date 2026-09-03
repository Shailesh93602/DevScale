import { describe, it, expect, jest } from '@jest/globals';
import type { Request, Response } from 'express';

import {
  bearerMatches,
  createMetricsHandler,
} from '../../middlewares/metricsEndpoint';

/**
 * `/metrics` must never be anonymously readable in production.
 *
 * The production API served its Prometheus registry to anyone because the
 * token gate was optional and the token was unset. This suite pins the three
 * states of the gate and the shape of the refusal — a 404 whose body is
 * byte-identical to the app's unknown-route response, so a probe cannot tell
 * a hidden endpoint from a missing one.
 */

function makeRes() {
  const headers: Record<string, string> = {};
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    ended: false,
    status: jest.fn(function (this: typeof res, code: number) {
      this.statusCode = code;
      return this;
    }),
    json: jest.fn(function (this: typeof res, body: unknown) {
      this.body = body;
      this.ended = true;
      return this;
    }),
    set: jest.fn(function (this: typeof res, k: string, v: string) {
      headers[k] = v;
      return this;
    }),
    end: jest.fn(function (this: typeof res, body?: unknown) {
      if (body !== undefined) this.body = body;
      this.ended = true;
      return this;
    }),
    headers,
  };
  return res;
}

function makeReq(authorization?: string): Request {
  return {
    headers: authorization ? { authorization } : {},
  } as unknown as Request;
}

const REGISTRY = '# HELP up 1\nup 1\n';
const CONTENT_TYPE = 'text/plain; version=0.0.4; charset=utf-8';

function handler(token: string | undefined, nodeEnv: string | undefined) {
  return createMetricsHandler({
    token,
    nodeEnv,
    contentType: CONTENT_TYPE,
    render: async () => REGISTRY,
  });
}

describe('GET /metrics gate', () => {
  it('production with no METRICS_TOKEN answers 404 with the unknown-route body', async () => {
    const res = makeRes();
    await handler(undefined, 'production')(
      makeReq(),
      res as unknown as Response
    );

    expect(res.statusCode).toBe(404);
    // Same body as main.ts's default 404 handler — deliberately indistinguishable.
    expect(res.body).toEqual({ message: 'Route not found' });
    expect(res.headers['Content-Type']).toBeUndefined();
  });

  it('production with an empty/whitespace METRICS_TOKEN is treated as unset', async () => {
    // A blank value in a dashboard is the most likely misconfiguration, and
    // `if (token)` on '   ' is truthy — it would have "gated" on a token of
    // spaces and served nothing useful while looking configured.
    const res = makeRes();
    await handler('   ', 'production')(makeReq(), res as unknown as Response);
    expect(res.statusCode).toBe(404);
  });

  it('a configured token refuses anonymous requests with 401', async () => {
    const res = makeRes();
    await handler('s3cret', 'production')(
      makeReq(),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(401);
    expect(res.body).toBeUndefined();
  });

  it('a configured token refuses the wrong token and the wrong scheme', async () => {
    for (const bad of [
      'Bearer wrong',
      'Bearer s3cret ',
      'Basic s3cret',
      's3cret',
      'Bearer S3CRET',
    ]) {
      const res = makeRes();
      await handler('s3cret', 'production')(
        makeReq(bad),
        res as unknown as Response
      );
      expect(res.statusCode).toBe(401);
    }
  });

  it('a configured token serves the registry to the matching bearer', async () => {
    const res = makeRes();
    await handler('s3cret', 'production')(
      makeReq('Bearer s3cret'),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(200);
    expect(res.headers['Content-Type']).toBe(CONTENT_TYPE);
    expect(res.body).toBe(REGISTRY);
  });

  it('the token gate applies outside production too, once a token is set', async () => {
    const res = makeRes();
    await handler('s3cret', 'development')(
      makeReq(),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(401);
  });

  it('development with no token serves the registry (local scrape convenience)', async () => {
    const res = makeRes();
    await handler(undefined, 'development')(
      makeReq(),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe(REGISTRY);
  });
});

describe('bearerMatches', () => {
  it('is exact on scheme, spacing and value', () => {
    expect(bearerMatches('Bearer abc', 'abc')).toBe(true);
    expect(bearerMatches('bearer abc', 'abc')).toBe(false);
    expect(bearerMatches('Bearer  abc', 'abc')).toBe(false);
    expect(bearerMatches('Bearer ab', 'abc')).toBe(false);
    expect(bearerMatches('Bearer abcd', 'abc')).toBe(false);
    expect(bearerMatches(undefined, 'abc')).toBe(false);
    expect(bearerMatches('', 'abc')).toBe(false);
  });

  it('does not throw on length mismatch (timingSafeEqual requires equal lengths)', () => {
    expect(() =>
      bearerMatches('Bearer x', 'a-much-longer-token')
    ).not.toThrow();
  });
});

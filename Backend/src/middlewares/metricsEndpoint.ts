import { timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';

/**
 * `GET /metrics` — the Prometheus scrape endpoint, gated.
 *
 * WHY THIS IS NOT "OPTIONALLY" GATED ANY MORE.
 *
 * The previous handler read `METRICS_TOKEN` and, when it was unset, served the
 * registry to anyone. The production deployment had it unset, so
 * `api-eduscale.vercel.app/metrics` answered every anonymous request with the
 * full route table (every Express route pattern that had ever been hit),
 * per-route latency histograms, status-code counts, heap size and event-loop
 * lag. None of that is a credential, but all of it is reconnaissance: it names
 * every endpoint including the admin ones, and it tells an attacker which
 * routes are slow enough to be worth hammering.
 *
 * The rule is now:
 *
 *   - token set          → serve only to `Authorization: Bearer <token>`;
 *                          anything else is 401.
 *   - token unset, prod  → 404, indistinguishable from an unknown route. A
 *                          scraper that was never configured has nothing to
 *                          scrape, and a stranger learns nothing.
 *   - token unset, dev   → serve, so `curl localhost:5000/metrics` still works
 *                          on a laptop without ceremony.
 *
 * The comparison is constant-time. A `!==` on secrets leaks their length and
 * prefix through response timing; that is a small leak, but it costs one line
 * to close.
 */

export interface MetricsEndpointOptions {
  /** The shared secret a scraper must present. Empty/undefined = not configured. */
  token: string | undefined;
  /** `process.env.NODE_ENV` at construction time. */
  nodeEnv: string | undefined;
  /** Produces the registry text; injected so the handler is testable without prom-client. */
  render: () => Promise<string>;
  /** Value for the Content-Type header (prom-client's `register.contentType`). */
  contentType: string;
}

/** True when a request carries exactly `Bearer <token>`. Constant-time on the secret. */
export function bearerMatches(
  authorization: string | undefined,
  token: string
): boolean {
  if (!authorization) return false;
  const expected = Buffer.from(`Bearer ${token}`);
  const presented = Buffer.from(authorization);
  if (expected.length !== presented.length) return false;
  return timingSafeEqual(expected, presented);
}

/**
 * The 404 body mirrors the app's own unknown-route handler in main.ts on
 * purpose: a probe must not be able to tell "metrics exists but is hidden"
 * from "no such route".
 */
const NOT_FOUND_BODY = { message: 'Route not found' } as const;

export function createMetricsHandler(options: MetricsEndpointOptions) {
  const token = options.token?.trim() || undefined;
  const isProduction = options.nodeEnv === 'production';

  return async (req: Request, res: Response): Promise<void> => {
    if (!token) {
      if (isProduction) {
        res.status(404).json(NOT_FOUND_BODY);
        return;
      }
    } else if (!bearerMatches(req.headers.authorization, token)) {
      res.status(401).end();
      return;
    }

    res.set('Content-Type', options.contentType);
    res.end(await options.render());
  };
}

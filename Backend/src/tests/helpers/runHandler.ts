import type { NextFunction, Request, Response } from 'express';

export interface HandlerOutcome {
  status?: number;
  body?: unknown;
  /** What the handler passed to next() — an AppError for a refused request. */
  error?: { statusCode?: number; message?: string };
}

/**
 * Runs an Express handler (catchAsync-wrapped or not) and resolves with what
 * reached the wire: the response status/body, or the error given to next().
 */
export function runHandler(
  handler: (req: Request, res: Response, next: NextFunction) => unknown,
  req: Partial<Request>
): Promise<HandlerOutcome> {
  return new Promise((resolve) => {
    const out: HandlerOutcome = {};
    const res = {
      status(code: number) {
        out.status = code;
        return this;
      },
      json(body: unknown) {
        out.body = body;
        resolve(out);
        return this;
      },
      setHeader() {
        return this;
      },
    } as unknown as Response;
    const next = ((err?: unknown) => {
      out.error = err as HandlerOutcome['error'];
      resolve(out);
    }) as NextFunction;
    handler({ body: {}, query: {}, params: {}, ...req } as Request, res, next);
  });
}

import { Router, Request, Response, NextFunction } from 'express';

// UUID v4 pattern — used to validate all :id route params
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Some IDs are slugs (e.g. battle slugs, short keys) — allow alphanumeric + hyphens up to 120 chars
const SLUG_OR_UUID_REGEX = /^[a-zA-Z0-9_-]{2,120}$/;

export abstract class BaseRouter {
  protected readonly router: Router;

  constructor() {
    this.router = Router();
    // Global :id param validator — rejects obviously malformed IDs before they hit DB
    this.router.param(
      'id',
      (req: Request, res: Response, next: NextFunction, id: string) => {
        if (!UUID_REGEX.test(id) && !SLUG_OR_UUID_REGEX.test(id)) {
          res.status(400).json({
            status: 400,
            error: true,
            message: 'Invalid id parameter',
          });
          return;
        }
        next();
      }
    );
  }

  protected abstract initializeRoutes(): void;

  public getRouter(): Router {
    this.initializeRoutes();
    return this.router;
  }
}

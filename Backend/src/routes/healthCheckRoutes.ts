import { BaseRouter } from './BaseRouter';
import { NODE_ENV } from '../config';

export class HealthCheckRoutes extends BaseRouter {
  protected initializeRoutes(): void {
    this.router.get('/', (req, res) => {
      res.json({
        status: 'ok',
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    });
  }
}

export default new HealthCheckRoutes().getRouter();

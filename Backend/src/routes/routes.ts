import { Router } from 'express';
import { UserRoutes } from './userRoutes';
import { AdminRoutes } from './adminRoutes';
import { AnalyticsRoutes } from './analyticsRoutes';
import { RoadMapRoutes } from './roadMapRoutes';
import { ArticleRoutes } from './articleRoutes';
import { ResourceRoutes } from './resourceRoutes';
import { ChallengeRoutes } from './challengeRoutes';
import { TopicRoutes } from './topicRoutes';
import { SubjectRoutes } from './subjectRoutes';
import { MainConceptRoutes } from './mainConceptRoutes';
import { HealthCheckRoutes } from './healthCheckRoutes';

export class AppRoutes {
  private readonly router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Health check route
    this.router.use('/health', new HealthCheckRoutes().getRouter());

    // Feature routes
    this.router.use('/users', new UserRoutes().getRouter());
    this.router.use('/admin', new AdminRoutes().getRouter());
    this.router.use('/analytics', new AnalyticsRoutes().getRouter());
    this.router.use('/roadMaps', new RoadMapRoutes().getRouter());
    this.router.use('/articles', new ArticleRoutes().getRouter());
    this.router.use('/resources', new ResourceRoutes().getRouter());
    this.router.use('/challenges', new ChallengeRoutes().getRouter());
    this.router.use('/topics', new TopicRoutes().getRouter());
    this.router.use('/subjects', new SubjectRoutes().getRouter());
    this.router.use('/mainConcepts', new MainConceptRoutes().getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}

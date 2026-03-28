import { Router } from 'express';
import { UserRoutes } from './userRoutes.js';
import { AdminRoutes } from './adminRoutes.js';
import { AnalyticsRoutes } from './analyticsRoutes.js';
import { RoadMapRoutes } from './roadMapRoutes.js';
import { ArticleRoutes } from './articleRoutes.js';
import { ResourceRoutes } from './resourceRoutes.js';
import { ChallengeRoutes } from './challengeRoutes.js';
import { TopicRoutes } from './topicRoutes.js';
import { SubjectRoutes } from './subjectRoutes.js';
import { MainConceptRoutes } from './mainConceptRoutes.js';
import { HealthCheckRoutes } from './healthCheckRoutes.js';
import { StreakRoutes } from './streakRoutes.js';
import { DashboardRoutes } from './dashboardRoutes.js';
import { BattleRoutes } from './battleRoutes.js';
import { ChatRoutes } from './chatRoutes.js';
import { CommunityForumRoutes } from './communityForumRoutes.js';
import { CourseRoutes } from './courseRoutes.js';
import { JobRoutes } from './jobRoutes.js';
import { LeaderboardRoutes } from './leaderBoardRoutes.js';
import { PlacementRoutes } from './placementRoutes.js';
import { ProgressRoutes } from './progressRoutes.js';
import { QuestionRoutes } from './questionRoutes.js';
import { QuizRouter } from './quizRoutes.js';
import { RBACRoutes } from './rbacRoutes.js';
import { SupportRoutes } from './supportRoutes.js';
import { CodeRoutes } from './codeRoutes.js';
import { AuthRoutes } from './authRoutes.js';
import { StatsRoutes } from './statsRoutes.js';
import { SubscriptionRoutes } from './subscriptionRoutes.js';

export class AppRoutes {
  private readonly router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Health check route
    this.router.get('/debug-sentry', () => {
      throw new Error('My first Sentry error!');
    });
    this.router.use('/health', new HealthCheckRoutes().getRouter());

    // Auth routes (logout, cache refresh)
    this.router.use('/auth', new AuthRoutes().getRouter());

    // Feature routes
    this.router.use('/users', new UserRoutes().getRouter());
    this.router.use('/admin', new AdminRoutes().getRouter());
    this.router.use('/analytics', new AnalyticsRoutes().getRouter());
    this.router.use('/roadmaps', new RoadMapRoutes().getRouter());
    this.router.use('/articles', new ArticleRoutes().getRouter());
    this.router.use('/resources', new ResourceRoutes().getRouter());
    this.router.use('/challenges', new ChallengeRoutes().getRouter());
    this.router.use('/topics', new TopicRoutes().getRouter());
    this.router.use('/subjects', new SubjectRoutes().getRouter());
    this.router.use('/main-concepts', new MainConceptRoutes().getRouter());
    this.router.use('/streak', new StreakRoutes().getRouter());
    this.router.use('/dashboard', new DashboardRoutes().getRouter());

    // Additional feature routes (newly registered)
    this.router.use('/battles', new BattleRoutes().getRouter());
    this.router.use('/chat', new ChatRoutes().getRouter());
    this.router.use('/forums', new CommunityForumRoutes().getRouter());
    this.router.use('/courses', new CourseRoutes().getRouter());
    this.router.use('/jobs', new JobRoutes().getRouter());
    this.router.use('/leaderboard', new LeaderboardRoutes().getRouter());
    this.router.use('/placement', new PlacementRoutes().getRouter());
    this.router.use('/progress', new ProgressRoutes().getRouter());
    this.router.use('/questions', new QuestionRoutes().getRouter());
    this.router.use('/quiz', new QuizRouter().getRouter());
    this.router.use('/rbac', new RBACRoutes().getRouter());
    this.router.use('/support', new SupportRoutes().getRouter());
    this.router.use('/run-code', new CodeRoutes().getRouter());
    this.router.use('/stats', new StatsRoutes().getRouter());
    this.router.use('/billing', new SubscriptionRoutes().getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}
